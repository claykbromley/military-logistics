"use client"

import { useState } from "react"
import { Building2, CheckCircle2, Plus, Trash2, Loader2, Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Account {
  id: string
  name: string
  type: string
  balance: number
  institution: string
}

interface BankConnectionProps {
  isConnected: boolean
  setIsConnected: (value: boolean) => void
  accounts: Account[]
  setAccounts: (accounts: Account[]) => void
}

const MOCK_BANKS = [
  { name: "USAA", logo: "🏦" },
  { name: "Navy Federal", logo: "⚓" },
  { name: "Pentagon FCU", logo: "🏛️" },
  { name: "Armed Forces Bank", logo: "🎖️" },
]

export function BankConnection({ isConnected, setIsConnected, accounts, setAccounts }: BankConnectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [credentials, setCredentials] = useState({ username: "", password: "" })

  const handleConnect = async () => {
    if (!selectedBank || !credentials.username || !credentials.password) return

    setIsConnecting(true)

    // Simulate API call to connect bank
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newAccounts: Account[] = [
      { id: "1", name: "Checking Account", type: "checking", balance: 4523.89, institution: selectedBank },
      { id: "2", name: "Savings Account", type: "savings", balance: 12750.0, institution: selectedBank },
    ]

    setAccounts([...accounts, ...newAccounts])
    setIsConnected(true)
    setIsConnecting(false)
    setIsDialogOpen(false)
    setSelectedBank(null)
    setCredentials({ username: "", password: "" })
  }

  const handleRemoveAccount = (id: string) => {
    const updated = accounts.filter((acc) => acc.id !== id)
    setAccounts(updated)
    if (updated.length === 0) setIsConnected(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Building2 className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Bank Accounts</CardTitle>
              <CardDescription>Connect your accounts to track expenses</CardDescription>
            </div>
          </div>
          {isConnected && (
            <Badge className="bg-accent text-accent-foreground">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{account.name}</p>
                    <p className="text-sm text-muted-foreground">{account.institution}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ${account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{account.type}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveAccount(account.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">No bank accounts connected</p>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Connect Bank Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Connect Your Bank</DialogTitle>
              <DialogDescription>
                Select your financial institution and enter your credentials securely.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {MOCK_BANKS.map((bank) => (
                  <button
                    key={bank.name}
                    onClick={() => setSelectedBank(bank.name)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedBank === bank.name
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <span className="text-2xl">{bank.logo}</span>
                    <p className="font-medium mt-2 text-foreground">{bank.name}</p>
                  </button>
                ))}
              </div>

              {selectedBank && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      value={credentials.username}
                      onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span>Your credentials are encrypted and secure</span>
                  </div>
                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting || !credentials.username || !credentials.password}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Connect Account"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
