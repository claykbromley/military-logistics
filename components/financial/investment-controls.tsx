"use client"

import { useState } from "react"
import { TrendingUp, Plus, Trash2, Settings2, DollarSign, Hash, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface InvestmentRule {
  id: string
  type: "amount" | "shares"
  symbol: string
  value: number
  frequency: "weekly" | "biweekly" | "monthly"
  minPrice?: number
  maxPrice?: number
  isActive: boolean
}

interface InvestmentControlsProps {
  isConnected: boolean
}

export function InvestmentControls({ isConnected }: InvestmentControlsProps) {
  const [rules, setRules] = useState<InvestmentRule[]>([
    { id: "1", type: "amount", symbol: "QQQ", value: 200, frequency: "biweekly", isActive: true },
    {
      id: "2",
      type: "shares",
      symbol: "AAPL",
      value: 1,
      frequency: "monthly",
      minPrice: 150,
      maxPrice: 200,
      isActive: true,
    },
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [investmentType, setInvestmentType] = useState<"amount" | "shares">("amount")
  const [newRule, setNewRule] = useState({
    symbol: "",
    value: "",
    frequency: "monthly" as "weekly" | "biweekly" | "monthly",
    minPrice: "",
    maxPrice: "",
  })

  const handleAddRule = () => {
    if (!newRule.symbol || !newRule.value) return

    const rule: InvestmentRule = {
      id: Date.now().toString(),
      type: investmentType,
      symbol: newRule.symbol.toUpperCase(),
      value: Number.parseFloat(newRule.value),
      frequency: newRule.frequency,
      minPrice: newRule.minPrice ? Number.parseFloat(newRule.minPrice) : undefined,
      maxPrice: newRule.maxPrice ? Number.parseFloat(newRule.maxPrice) : undefined,
      isActive: true,
    }

    setRules([...rules, rule])
    setNewRule({ symbol: "", value: "", frequency: "monthly", minPrice: "", maxPrice: "" })
    setIsDialogOpen(false)
  }

  const toggleRule = (id: string) => {
    setRules(rules.map((rule) => (rule.id === id ? { ...rule, isActive: !rule.isActive } : rule)))
  }

  const deleteRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id))
  }

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case "weekly":
        return "Weekly"
      case "biweekly":
        return "Bi-weekly"
      case "monthly":
        return "Monthly"
      default:
        return freq
    }
  }

  const calculateMonthlyInvestment = () => {
    return rules
      .filter((r) => r.isActive && r.type === "amount")
      .reduce((sum, rule) => {
        const multiplier = rule.frequency === "weekly" ? 4 : rule.frequency === "biweekly" ? 2 : 1
        return sum + rule.value * multiplier
      }, 0)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <TrendingUp className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Auto-Invest Rules</CardTitle>
              <CardDescription>Automate your investment contributions</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Est. Monthly</p>
            <p className="text-xl font-bold text-accent">${calculateMonthlyInvestment().toFixed(2)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {rules.length > 0 ? (
          <div className="space-y-3 mb-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 rounded-lg border transition-all ${
                  rule.isActive ? "border-border bg-secondary/30" : "border-border bg-muted/30 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch checked={rule.isActive} onCheckedChange={() => toggleRule(rule.id)} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-foreground">{rule.symbol}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {rule.type === "amount" ? "$ Amount" : "# Shares"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {getFrequencyLabel(rule.frequency)}
                        {(rule.minPrice || rule.maxPrice) && (
                          <span className="text-xs">
                            • Price: ${rule.minPrice || "0"} - ${rule.maxPrice || "∞"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {rule.type === "amount" ? `$${rule.value.toFixed(2)}` : `${rule.value} shares`}
                      </p>
                      <p className="text-xs text-muted-foreground">per {rule.frequency.replace("ly", "")}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRule(rule.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-lg mb-4">
            <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No investment rules set up</p>
            <p className="text-sm text-muted-foreground">Create rules to auto-invest while deployed</p>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Investment Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Investment Rule</DialogTitle>
              <DialogDescription>Set up automatic investments that run while you're deployed.</DialogDescription>
            </DialogHeader>

            <Tabs value={investmentType} onValueChange={(v: any) => setInvestmentType(v as "amount" | "shares")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="amount" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Fixed Amount
                </TabsTrigger>
                <TabsTrigger value="shares" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Share Count
                </TabsTrigger>
              </TabsList>

              <TabsContent value="amount" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Stock/ETF Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="e.g., VTI"
                      value={newRule.symbol}
                      onChange={(e) => setNewRule({ ...newRule, symbol: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="100.00"
                      value={newRule.value}
                      onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={newRule.frequency}
                    onValueChange={(v) => setNewRule({ ...newRule, frequency: v as "weekly" | "biweekly" | "monthly" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly (matches pay)</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="shares" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="symbol-shares">Stock Symbol</Label>
                    <Input
                      id="symbol-shares"
                      placeholder="e.g., AAPL"
                      value={newRule.symbol}
                      onChange={(e) => setNewRule({ ...newRule, symbol: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shares">Number of Shares</Label>
                    <Input
                      id="shares"
                      type="number"
                      placeholder="1"
                      value={newRule.value}
                      onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={newRule.frequency}
                    onValueChange={(v) => setNewRule({ ...newRule, frequency: v as "weekly" | "biweekly" | "monthly" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly (matches pay)</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 rounded-lg bg-secondary border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Price Limits (Optional)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="min-price" className="text-xs">
                        Min Price ($)
                      </Label>
                      <Input
                        id="min-price"
                        type="number"
                        placeholder="0"
                        value={newRule.minPrice}
                        onChange={(e) => setNewRule({ ...newRule, minPrice: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="max-price" className="text-xs">
                        Max Price ($)
                      </Label>
                      <Input
                        id="max-price"
                        type="number"
                        placeholder="No limit"
                        value={newRule.maxPrice}
                        onChange={(e) => setNewRule({ ...newRule, maxPrice: e.target.value })}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Only buy when share price is within this range</p>
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleAddRule}
              disabled={!newRule.symbol || !newRule.value}
              className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Create Investment Rule
            </Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
