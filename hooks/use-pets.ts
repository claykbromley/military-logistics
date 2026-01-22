"use client"

import { useState, useEffect, useCallback } from "react"

export type PetType = "dog" | "cat" | "bird" | "fish" | "reptile" | "small_mammal" | "other"

export interface VetRecord {
  id: string
  date: string
  type: string
  notes?: string
  nextDue?: string
}

export interface Pet {
  id: string
  name: string
  petType: PetType
  breed?: string
  age?: number
  weight?: string
  microchipId?: string
  vetName?: string
  vetPhone?: string
  insuranceCompany?: string
  insurancePolicy?: string
  caregiverName?: string
  caregiverPhone?: string
  caregiverEmail?: string
  specialNeeds?: string
  feedingInstructions?: string
  medications?: string
  vetRecords: VetRecord[]
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "deployment-pets"

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setPets(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse pets:", e)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pets))
    }
  }, [pets, isLoaded])

  const addPet = useCallback((pet: Omit<Pet, "id" | "createdAt" | "updatedAt" | "vetRecords">) => {
    const now = new Date().toISOString()
    const newPet: Pet = {
      ...pet,
      id: `pet_${generateId()}`,
      vetRecords: [],
      createdAt: now,
      updatedAt: now,
    }
    setPets((prev) => [...prev, newPet])
    return newPet
  }, [])

  const updatePet = useCallback((id: string, updates: Partial<Pet>) => {
    setPets((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    )
  }, [])

  const deletePet = useCallback((id: string) => {
    setPets((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const addVetRecord = useCallback((petId: string, record: Omit<VetRecord, "id">) => {
    const newRecord: VetRecord = {
      ...record,
      id: `vet_${generateId()}`,
    }
    setPets((prev) =>
      prev.map((p) =>
        p.id === petId
          ? {
              ...p,
              vetRecords: [...p.vetRecords, newRecord],
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    )
    return newRecord
  }, [])

  const deleteVetRecord = useCallback((petId: string, recordId: string) => {
    setPets((prev) =>
      prev.map((p) =>
        p.id === petId
          ? {
              ...p,
              vetRecords: p.vetRecords.filter((r) => r.id !== recordId),
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    )
  }, [])

  const getUpcomingVetVisits = useCallback(
    (withinDays: number = 60) => {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() + withinDays)
      const visits: { petId: string; petName: string; record: VetRecord }[] = []
      pets.forEach((pet) => {
        pet.vetRecords.forEach((record) => {
          if (record.nextDue && new Date(record.nextDue) <= cutoff) {
            visits.push({ petId: pet.id, petName: pet.name, record })
          }
        })
      })
      return visits.sort((a, b) => new Date(a.record.nextDue!).getTime() - new Date(b.record.nextDue!).getTime())
    },
    [pets]
  )

  return {
    pets,
    isLoaded,
    addPet,
    updatePet,
    deletePet,
    addVetRecord,
    deleteVetRecord,
    getUpcomingVetVisits,
  }
}
