"use client"

import { useState, useMemo, useEffect } from "react"
import { Target, Plus, Trash2, Pencil, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGoals } from "@/hooks/use-financial-manager"

const GOAL_CATEGORIES = [
  { value: "emergency_fund", label: "Emergency Fund" },
  { value: "deployment_savings", label: "Deployment Savings (SDP)" },
  { value: "tsp", label: "TSP Contribution" },
  { value: "debt_payoff", label: "Debt Payoff" },
  { value: "down_payment", label: "Down Payment" },
  { value: "vehicle", label: "Vehicle Purchase" },
  { value: "education", label: "Education (GI Bill Gap)" },
  { value: "transition", label: "Transition Fund" },
  { value: "custom", label: "Custom Goal" },
]

export function FinancialGoals() {
  const { data: goals, isLoading, mutate, addGoal, updateGoal: updateGoalInDb, deleteGoal: deleteGoalFromDb } = useGoals()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [newGoal, setNewGoal] = useState({
    name: "",
    target_amount: "",
    current_amount: "",
    category: "custom",
    target_date: "",
  })
  const goalsList = goals || []

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
          setIsLoggedIn(true)
          await Promise.all([mutate()])
        }

        if (event === "SIGNED_OUT") {
          setIsLoggedIn(false)
          mutate([], false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, mutate])

  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.target_amount) return
    try {
      await addGoal({
        name: newGoal.name,
        target_amount: parseFloat(newGoal.target_amount),
        current_amount: newGoal.current_amount
          ? (parseFloat(newGoal.current_amount) >= parseFloat(newGoal.target_amount)
            ? parseFloat(newGoal.target_amount)
            : parseFloat(newGoal.current_amount))
          : 0,
        category: newGoal.category,
        target_date: newGoal.target_date || null,
        is_completed: newGoal.current_amount
          ? parseFloat(newGoal.current_amount) >= parseFloat(newGoal.target_amount)
          : false,
      })
      setNewGoal({ name: "", target_amount: "", current_amount: "", category: "custom", target_date: "" })
      setIsDialogOpen(false)
    } catch (err) {
      console.error("Add goal failed:", err)
    }
  }

  const updateGoalProgress = async (id: string) => {
    if (!editAmount) return
    const goal = goalsList.find((g) => g.id === id)
    if (!goal) return

    const target = Number(goal.target_amount)
    const entered = parseFloat(editAmount)
    const clamped = Math.min(entered, target)

    try {
      await updateGoalInDb(id, {
        current_amount: clamped,
        is_completed: clamped >= target,
      })
      setEditingGoal(null)
      setEditAmount("")
    } catch (err) {
      console.error("Update goal failed:", err)
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      await deleteGoalFromDb(id)
    } catch (err) {
      console.error("Delete goal failed:", err)
    }
  }

  const getCategoryLabel = (value: string) =>
    GOAL_CATEGORIES.find((c) => c.value === value)?.label || value

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
          <div className="space-y-4">
            {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
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
              <Target className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Financial Goals</CardTitle>
              <CardDescription>Track progress toward your financial milestones</CardDescription>
            </div>
          </div>
          {goalsList.length > 0 && (
            <Badge variant="outline">
              {goalsList.filter((g) => g.is_completed).length}/{goalsList.length} Complete
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {goalsList.length > 0 ? (
          <div className="space-y-4 mb-4">
            {goalsList.map((goal) => {
              const progress = Math.min(
                (Number(goal.current_amount) / Number(goal.target_amount)) * 100,
                100
              )
              const isCompleted = goal.is_completed || Number(goal.current_amount) >= Number(goal.target_amount)
              const isEditing = editingGoal === goal.id

              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isCompleted
                      ? "border-accent/50 bg-accent/5 opacity-75"
                      : "border-border bg-primary/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{goal.name}</h4>
                      {isCompleted && (
                        <Badge className="bg-accent text-accent-foreground text-[10px]">
                          <Check className="w-3 h-3 mr-0.5" />
                          Complete
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {!isCompleted && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingGoal(isEditing ? null : goal.id)
                            setEditAmount(String(goal.current_amount))
                          }}
                          className="text-muted-foreground hover:text-white h-8 w-8 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteGoal(goal.id)}
                        className="text-muted-foreground hover:text-destructive h-8 w-8 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px]">
                      {getCategoryLabel(goal.category)}
                    </Badge>
                    {goal.target_date && (
                      <span className="text-xs text-muted-foreground">
                        Target: {new Date(goal.target_date + "T00:00:00").toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        ${Number(goal.current_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="font-medium text-foreground">
                        ${Number(goal.target_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">{progress.toFixed(1)}%</p>
                  </div>

                  {isEditing && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                      <Input
                        type="number"
                        placeholder="Current amount"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => updateGoalProgress(goal.id)}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        Update
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-border dark:border-slate-500 rounded-lg mb-4">
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No financial goals set</p>
            <p className="text-sm text-muted-foreground">Set goals to track your progress</p>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer" disabled={!isLoggedIn}>
              <Plus className="w-4 h-4 mr-2" />
              {!isLoggedIn && "Log In to "}Add Financial Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Financial Goal</DialogTitle>
              <DialogDescription>
                Set a financial target to work toward during your service.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Goal Name</Label>
                <Input
                  placeholder="e.g., Emergency Fund"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newGoal.category}
                  onValueChange={(v) => setNewGoal({ ...newGoal, category: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GOAL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Amount ($)</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Amount ($)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newGoal.current_amount}
                    onChange={(e) => setNewGoal({ ...newGoal, current_amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Target Date (Optional)</Label>
                <Input
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                />
              </div>
              <Button
                onClick={handleAddGoal}
                disabled={!newGoal.name || !newGoal.target_amount}
                className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
