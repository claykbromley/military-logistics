"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { Building2, CheckCircle2, Plus, Loader2, RefreshCw, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAccounts } from "@/hooks/use-financial-manager"
import { createClient } from "@/lib/supabase/client"
import { KYCDialog } from "@/components/financial/kyc-dialog"
import { fetcher } from "@/lib/fetcher"
import useSWR from "swr"

interface AlpacaAccountStatus {
  has_account: boolean
  alpaca_account_id?: string
  account_number?: string
  status?: string
}

export function BankConnection() {
  const { data, error, isLoading, mutate } = useAccounts()
  const { data: alpacaStatus, mutate: mutateAlpaca } = useSWR<AlpacaAccountStatus>("/api/alpaca/create-account", fetcher)
  const [isConnecting, setIsConnecting] = useState(false)
  const [plaidReady, setPlaidReady] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showKYCDialog, setShowKYCDialog] = useState(false)
  const [pendingPlaidData, setPendingPlaidData] = useState<{
    public_token: string
    institution: { institution_id?: string; name?: string } | undefined
  } | null>(null)

  const accounts = data?.accounts || []
  const items = data?.items || []
  const isConnected = accounts.length > 0
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance_current || 0), 0)

  const supabase = useMemo(() => createClient(), [])
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_IN") {
          mutate({ accounts: [], items: [] }, false)
          await Promise.all([mutate()])
        }

        if (event === "SIGNED_OUT") {
          mutate({ accounts: [], items: [] }, false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, mutate])

  // Load Plaid Link script
  useEffect(() => {
    if (document.getElementById("plaid-link-script")) {
      setPlaidReady(true)
      return
    }
    const script = document.createElement("script")
    script.id = "plaid-link-script"
    script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js"
    script.onload = () => setPlaidReady(true)
    document.head.appendChild(script)
  }, [])

  const handleKYCComplete = useCallback(async (kycData: {
    given_name: string
    family_name: string
    email: string
    phone: string
    date_of_birth: string
    tax_id: string
    street_address: string
    city: string
    state: string
    postal_code: string
    country: string
  }) => {
    if (!pendingPlaidData) return

    try {
      // Step 1: Create Alpaca account with KYC data
      const alpacaRes = await fetch("/api/alpaca/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kycData),
      })
      const alpacaResult = await alpacaRes.json()
      if (alpacaResult.error) {
        throw new Error(alpacaResult.error)
      }

      // Step 2: Exchange Plaid token
      await fetch("/api/plaid/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_token: pendingPlaidData.public_token,
          institution: pendingPlaidData.institution,
        }),
      })

      // Refresh both accounts and Alpaca status
      mutate()
      mutateAlpaca()
      setShowKYCDialog(false)
      setPendingPlaidData(null)
    } catch (err) {
      console.error("Account setup failed:", err)
      alert(`Account setup failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }, [pendingPlaidData, mutate, mutateAlpaca])

  const handleConnect = useCallback(async () => {
    setIsConnecting(true)
    try {
      // Step 1: Create a link token from our API
      const res = await fetch("/api/plaid/create-link-token", { method: "POST" })
      const tokenData = await res.json()
      if (tokenData.not_configured) {
        alert("Plaid API keys are not configured. Add PLAID_CLIENT_ID and PLAID_SECRET in the Vars sidebar.")
        setIsConnecting(false)
        return
      }
      const { link_token, error: tokenError } = tokenData
      if (tokenError) throw new Error(tokenError)

      // Step 2: Open Plaid Link
      if (!plaidReady || !(window as unknown as Record<string, unknown>).Plaid) {
        throw new Error("Plaid Link is still loading. Please try again.")
      }

      const PlaidModule = (window as unknown as { Plaid: { create: (config: Record<string, unknown>) => { open: () => void } } }).Plaid

      const handler = PlaidModule.create({
        token: link_token,
        onSuccess: async (public_token: string, metadata: { institution?: { institution_id?: string; name?: string } }) => {
          // Check if user already has Alpaca account
          if (alpacaStatus?.has_account) {
            // Already have Alpaca account - just exchange token
            try {
              await fetch("/api/plaid/exchange-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  public_token,
                  institution: metadata.institution,
                }),
              })
              mutate()
            } catch (err) {
              console.error("Token exchange failed:", err)
            }
            setIsConnecting(false)
          } else {
            // No Alpaca account - show KYC dialog first
            setPendingPlaidData({ public_token, institution: metadata.institution })
            setShowKYCDialog(true)
            setIsConnecting(false)
          }
        },
        onExit: () => {
          setIsConnecting(false)
        },
      })

      handler.open()
    } catch (err) {
      console.error("Plaid connect error:", err)
      setIsConnecting(false)
    }
  }, [plaidReady, mutate, alpacaStatus])

  const formatBalance = (amount: number) =>
    amount.toLocaleString("en-US", { style: "currency", currency: "USD" })

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "depository": return "Checking/Savings"
      case "credit": return "Credit"
      case "loan": return "Loan"
      case "investment": return "Investment"
      default: return type
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Building2 className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Bank Accounts</CardTitle>
              <CardDescription>
                {isConnected
                  ? `${accounts.length} account${accounts.length > 1 ? "s" : ""} connected via Plaid`
                  : "Connect your bank with Plaid secure link"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected && (
              <Badge className="bg-accent text-accent-foreground">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
            Failed to load accounts. Check your connection and try again.
          </div>
        )}

        {isConnected && (
          <>
            {/* Total balance summary */}
            <div className="mb-4 p-4 rounded-lg bg-primary/40 border border-border">
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-2xl font-bold text-foreground">{formatBalance(totalBalance)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Across {items.length} institution{items.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="space-y-2 mb-4 max-h-70 overflow-y-auto">
              {accounts.map((account) => {
                const institution = items.find((i) => i.id === account.plaid_item_id)
                return (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{account.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {institution?.institution_name || "Bank"}{" "}
                          {account.mask && <span className="text-xs">{"..."}  {account.mask}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatBalance(Number(account.balance_current || 0))}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {getAccountIcon(account.type)}
                        {account.subtype ? ` - ${account.subtype}` : ""}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent cursor-pointer dark:border-slate-500"
                onClick={() => mutate()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Balances
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-accent cursor-pointer"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </div>
          </>
        )}

        {!isConnected && (
          <>
            <div className="text-center py-8 border-2 border-dashed border-border dark:border-slate-500 rounded-lg mb-4">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-1">No bank accounts connected</p>
              <p className="text-xs text-muted-foreground">
                Securely connect via Plaid to auto-detect bills and track balances
              </p>
            </div>

            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={handleConnect}
              disabled={!isLoggedIn || isConnecting || !plaidReady}
            >
              {!isLoggedIn ?
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Log In to Connect with Plaid
                </> :
                isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Opening Plaid Link...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect with Plaid
                  </>
                )
              }
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-3">
              Plaid securely connects your accounts. We never see your bank credentials.
            </p>
          </>
        )}
      </CardContent>

      <KYCDialog
        open={showKYCDialog}
        onOpenChange={(open) => {
          setShowKYCDialog(open)
          if (!open) setPendingPlaidData(null)
        }}
        onComplete={handleKYCComplete}
      />
    </Card>
  )
}
