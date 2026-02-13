"use client"

import {
  X,
  Clock,
  MapPin,
  AlignLeft,
  Palette,
  Repeat,
  CalendarDays,
  CheckSquare,
  Trash2,
} from "lucide-react"
import type { CalendarEntry, EntryFormData, RecurrenceFreq } from "@/app/scheduler/calendar/types"
import { COLOR_OPTIONS, DAY_NAMES } from "@/app/scheduler/calendar/constants"
import { useEntryModal } from "./use-entry-modal"

// ─── Raw (dumb) modal — same UI as before ─────────────────

interface EntryModalProps {
  open: boolean
  editingEntry: CalendarEntry | null
  formData: EntryFormData
  saving: boolean
  showDeleteConfirm: boolean
  onFormChange: (data: EntryFormData) => void
  onSave: () => void
  onDelete: () => void
  onClose: () => void
  onShowDeleteConfirm: (show: boolean) => void
}

export function EntryModal({
  open,
  editingEntry,
  formData,
  saving,
  showDeleteConfirm,
  onFormChange,
  onSave,
  onDelete,
  onClose,
  onShowDeleteConfirm,
}: EntryModalProps) {
  if (!open) return null

  const isEvent = formData.type === "event"

  const update = (partial: Partial<EntryFormData>) => {
    onFormChange({ ...formData, ...partial })
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: formData.color }}
            />
            <h2 className="text-lg font-semibold text-foreground">
              {editingEntry
                ? `Edit ${isEvent ? "Event" : "Task"}`
                : `New ${isEvent ? "Event" : "Task"}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => update({ type: "event" })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                formData.type === "event"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Event
            </button>
            <button
              onClick={() => update({ type: "task" })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                formData.type === "task"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Task
            </button>
          </div>

          {/* Title */}
          <input
            type="text"
            placeholder={isEvent ? "Add title" : "Add task"}
            value={formData.title}
            onChange={(e) => update({ title: e.target.value })}
            className="w-full text-xl font-medium bg-transparent border-b-2 border-muted focus:border-primary outline-none pb-2 text-foreground placeholder:text-muted-foreground/50 transition-colors"
            autoFocus
          />

          {/* All-day toggle */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.all_day}
                onChange={(e) => update({ all_day: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-muted rounded-full peer-checked:bg-primary transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
            </div>
            <span className="text-sm text-foreground">All day</span>
          </label>

          {/* Date/Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    update({
                      start_date: e.target.value,
                      end_date:
                        e.target.value > formData.end_date
                          ? e.target.value
                          : formData.end_date,
                    })
                  }
                  className="bg-muted rounded-md px-3 py-1.5 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30"
                />
                {!formData.all_day && (
                  <>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => update({ start_time: e.target.value })}
                      className="bg-muted rounded-md px-3 py-1.5 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    {isEvent && (
                      <>
                        <span className="text-muted-foreground text-sm">to</span>
                        <input
                          type="time"
                          value={formData.end_time}
                          onChange={(e) => update({ end_time: e.target.value })}
                          className="bg-muted rounded-md px-3 py-1.5 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </>
                    )}
                  </>
                )}
                {formData.all_day && isEvent && (
                  <>
                    <span className="text-muted-foreground text-sm">to</span>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => update({ end_date: e.target.value })}
                      className="bg-muted rounded-md px-3 py-1.5 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Location (Event only) */}
          {isEvent && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Add location"
                value={formData.location}
                onChange={(e) => update({ location: e.target.value })}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none border-b border-transparent focus:border-muted transition-colors py-1"
              />
            </div>
          )}

          {/* Description */}
          <div className="flex items-start gap-2">
            <AlignLeft className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
            <textarea
              placeholder="Add description"
              value={formData.description}
              onChange={(e) => update({ description: e.target.value })}
              rows={2}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none border-b border-transparent focus:border-muted transition-colors py-1 resize-none"
            />
          </div>

          {/* Color */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex gap-1.5 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => update({ color: c.value })}
                  className={`w-6 h-6 rounded-full cursor-pointer transition-all ${
                    formData.color === c.value
                      ? "ring-2 ring-offset-2 ring-offset-card scale-110"
                      : "hover:scale-110"
                  }`}
                  style={{
                    backgroundColor: c.value,
                    ...(formData.color === c.value
                      ? { outlineColor: c.value }
                      : {}),
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Recurrence */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <Repeat className="w-4 h-4 text-muted-foreground" />
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.is_recurring}
                  onChange={(e) => update({ is_recurring: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-muted rounded-full peer-checked:bg-primary transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
              </div>
              <span className="text-sm text-foreground">Repeat</span>
            </label>

            {formData.is_recurring && (
              <div className="ml-6 space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Every</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={formData.recurrence_interval}
                    onChange={(e) =>
                      update({
                        recurrence_interval: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-14 bg-card rounded-md px-2 py-1 text-sm text-foreground border border-border outline-none focus:ring-2 focus:ring-primary/30 text-center"
                  />
                  <select
                    value={formData.recurrence_freq}
                    onChange={(e) =>
                      update({
                        recurrence_freq: e.target.value as RecurrenceFreq,
                      })
                    }
                    className="bg-card rounded-md px-3 py-1 text-sm text-foreground border border-border outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  >
                    <option value="daily">day(s)</option>
                    <option value="weekly">week(s)</option>
                    <option value="monthly">month(s)</option>
                    <option value="yearly">year(s)</option>
                  </select>
                </div>

                {formData.recurrence_freq === "weekly" && (
                  <div className="flex gap-1.5">
                    {DAY_NAMES.map((d, i) => (
                      <button
                        key={d}
                        onClick={() => {
                          const days = formData.recurrence_days.includes(i)
                            ? formData.recurrence_days.filter((x) => x !== i)
                            : [...formData.recurrence_days, i]
                          update({ recurrence_days: days })
                        }}
                        className={`w-8 h-8 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          formData.recurrence_days.includes(i)
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-muted-foreground border border-border hover:border-primary/50"
                        }`}
                      >
                        {d[0]}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Ends</span>
                  <input
                    type="date"
                    value={formData.recurrence_end}
                    onChange={(e) => update({ recurrence_end: e.target.value })}
                    className="bg-card rounded-md px-3 py-1 text-sm text-foreground border border-border outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Never"
                  />
                  {formData.recurrence_end && (
                    <button
                      onClick={() => update({ recurrence_end: "" })}
                      className="text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div>
            {editingEntry && (
              <>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => onShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-destructive">
                      Are you sure?
                    </span>
                    <button
                      onClick={onDelete}
                      disabled={saving}
                      className="text-xs bg-destructive text-destructive-foreground px-3 py-1 rounded-md hover:bg-destructive/90 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => onShowDeleteConfirm(false)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving || !formData.title.trim()}
              className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {saving ? "Saving..." : editingEntry ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Connected modal — auto-wires to EntryModalProvider ───
//
// Usage: just drop <ConnectedEntryModal /> anywhere inside an
// <EntryModalProvider>. No props needed.

export function ConnectedEntryModal() {
  const {
    isOpen,
    editingEntry,
    formData,
    saving,
    showDeleteConfirm,
    setFormData,
    save,
    deleteEntry,
    close,
    setShowDeleteConfirm,
  } = useEntryModal()

  return (
    <EntryModal
      open={isOpen}
      editingEntry={editingEntry}
      formData={formData}
      saving={saving}
      showDeleteConfirm={showDeleteConfirm}
      onFormChange={setFormData}
      onSave={save}
      onDelete={deleteEntry}
      onClose={close}
      onShowDeleteConfirm={setShowDeleteConfirm}
    />
  )
}