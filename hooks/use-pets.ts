"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

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
  vetAddress?: string
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

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Load data from Supabase
  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setUserId(null)
      setPets([])
      setIsLoaded(true)
      return
    }

    setUserId(user.id)
    setIsSyncing(true)

    try {
      // Fetch pets
      const { data: petsData, error: petsError } = await supabase
        .from("pets")
        .select("*")
        .order("created_at", { ascending: false })

      if (petsError) throw petsError

      // Fetch all vaccinations
      const { data: vaccinationsData } = await supabase
        .from("pet_vaccinations")
        .select("*")
        .order("expiration_date", { ascending: true })

      // Map pets with their vaccinations
      const petsWithVaccinations: Pet[] = (petsData || []).map((p) => ({
        id: p.id,
        name: p.name,
        petType: (p.species as PetType) || "other",
        breed: p.breed || undefined,
        age: p.date_of_birth ? Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined,
        weight: p.weight?.toString() || undefined,
        microchipId: p.microchip_number || undefined,
        vetName: p.vet_name || undefined,
        vetPhone: p.vet_phone || undefined,
        vetAddress: p.vet_address || undefined,
        insuranceCompany: p.insurance_company || undefined,
        insurancePolicy: p.insurance_policy_number || undefined,
        caregiverName: p.caretaker_name || undefined,
        caregiverPhone: p.caretaker_phone || undefined,
        caregiverEmail: undefined,
        specialNeeds: p.special_instructions || undefined,
        feedingInstructions: p.dietary_needs || undefined,
        medications: p.medications || undefined,
        vetRecords: (vaccinationsData || [])
          .filter((v) => v.pet_id === p.id)
          .map((v) => ({
            id: v.id,
            date: v.date_administered || "",
            type: v.vaccine_name,
            notes: v.notes || undefined,
            nextDue: v.expiration_date || undefined,
          })),
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }))

      setPets(petsWithVaccinations)
    } catch (error) {
      console.error("Failed to load pets:", error)
    } finally {
      setIsSyncing(false)
      setIsLoaded(true)
    }
  }, [])

  // Check auth and load data
  useEffect(() => {
    loadData()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadData()
    })

    return () => subscription.unsubscribe()
  }, [loadData])

  const addPet = useCallback(async (pet: Omit<Pet, "id" | "createdAt" | "updatedAt" | "vetRecords">) => {
    if (!userId) return null

    const supabase = createClient()
    const { data, error } = await supabase
      .from("pets")
      .insert({
        user_id: userId,
        name: pet.name,
        species: pet.petType,
        breed: pet.breed || null,
        date_of_birth: pet.age ? new Date(Date.now() - pet.age * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : null,
        weight: pet.weight ? Number.parseFloat(pet.weight) : null,
        microchip_number: pet.microchipId || null,
        vet_name: pet.vetName || null,
        vet_phone: pet.vetPhone || null,
        vet_address: pet.vetAddress || null,
        insurance_company: pet.insuranceCompany || null,
        insurance_policy_number: pet.insurancePolicy || null,
        caretaker_name: pet.caregiverName || null,
        caretaker_phone: pet.caregiverPhone || null,
        dietary_needs: pet.feedingInstructions || null,
        medications: pet.medications || null,
        special_instructions: pet.specialNeeds || null,
        notes: null,
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to add pet:", error)
      return null
    }

    const newPet: Pet = {
      id: data.id,
      name: data.name,
      petType: (data.species as PetType) || "other",
      breed: data.breed || undefined,
      age: pet.age,
      weight: data.weight?.toString() || undefined,
      microchipId: data.microchip_number || undefined,
      vetName: data.vet_name || undefined,
      vetPhone: data.vet_phone || undefined,
      vetAddress: data.vet_address || undefined,
      insuranceCompany: data.insurance_company || undefined,
      insurancePolicy: data.insurance_policy_number || undefined,
      caregiverName: data.caretaker_name || undefined,
      caregiverPhone: data.caretaker_phone || undefined,
      specialNeeds: data.special_instructions || undefined,
      feedingInstructions: data.dietary_needs || undefined,
      medications: data.medications || undefined,
      vetRecords: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    setPets((prev) => [newPet, ...prev])
    return newPet
  }, [userId])

  const updatePet = useCallback(async (id: string, updates: Partial<Pet>) => {
    if (!userId) return

    const supabase = createClient()
    const dbUpdates: Record<string, unknown> = {}

    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.petType !== undefined) dbUpdates.species = updates.petType
    if (updates.breed !== undefined) dbUpdates.breed = updates.breed || null
    if (updates.age !== undefined) {
      dbUpdates.date_of_birth = updates.age 
        ? new Date(Date.now() - updates.age * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] 
        : null
    }
    if (updates.weight !== undefined) dbUpdates.weight = updates.weight ? Number.parseFloat(updates.weight) : null
    if (updates.microchipId !== undefined) dbUpdates.microchip_number = updates.microchipId || null
    if (updates.vetName !== undefined) dbUpdates.vet_name = updates.vetName || null
    if (updates.vetPhone !== undefined) dbUpdates.vet_phone = updates.vetPhone || null
    if (updates.vetAddress !== undefined) dbUpdates.vet_address = updates.vetAddress || null
    if (updates.insuranceCompany !== undefined) dbUpdates.insurance_company = updates.insuranceCompany || null
    if (updates.insurancePolicy !== undefined) dbUpdates.insurance_policy_number = updates.insurancePolicy || null
    if (updates.caregiverName !== undefined) dbUpdates.caretaker_name = updates.caregiverName || null
    if (updates.caregiverPhone !== undefined) dbUpdates.caretaker_phone = updates.caregiverPhone || null
    if (updates.feedingInstructions !== undefined) dbUpdates.dietary_needs = updates.feedingInstructions || null
    if (updates.medications !== undefined) dbUpdates.medications = updates.medications || null
    if (updates.specialNeeds !== undefined) dbUpdates.special_instructions = updates.specialNeeds || null

    const { error } = await supabase
      .from("pets")
      .update(dbUpdates)
      .eq("id", id)

    if (error) {
      console.error("Failed to update pet:", error)
      return
    }

    setPets((prev) => prev.map((p) => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ))
  }, [userId])

  const deletePet = useCallback(async (id: string) => {
    if (!userId) return

    const supabase = createClient()
    const { error } = await supabase
      .from("pets")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Failed to delete pet:", error)
      return
    }

    setPets((prev) => prev.filter((p) => p.id !== id))
  }, [userId])

  const addVetRecord = useCallback(async (petId: string, record: Omit<VetRecord, "id">) => {
    if (!userId) return null

    const supabase = createClient()
    const { data, error } = await supabase
      .from("pet_vaccinations")
      .insert({
        user_id: userId,
        pet_id: petId,
        vaccine_name: record.type,
        date_administered: record.date || null,
        expiration_date: record.nextDue || null,
        notes: record.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to add vet record:", error)
      return null
    }

    const newRecord: VetRecord = {
      id: data.id,
      date: data.date_administered || "",
      type: data.vaccine_name,
      notes: data.notes || undefined,
      nextDue: data.expiration_date || undefined,
    }

    setPets((prev) => prev.map((p) => 
      p.id === petId 
        ? { ...p, vetRecords: [...p.vetRecords, newRecord], updatedAt: new Date().toISOString() }
        : p
    ))

    return newRecord
  }, [userId])

  const updateVetRecord = useCallback(async (petId: string, recordId: string, updates: Partial<VetRecord>) => {
    if (!userId) return

    const supabase = createClient()
    const dbUpdates: Record<string, unknown> = {}

    if (updates.type !== undefined) dbUpdates.vaccine_name = updates.type
    if (updates.date !== undefined) dbUpdates.date_administered = updates.date || null
    if (updates.nextDue !== undefined) dbUpdates.expiration_date = updates.nextDue || null
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null

    const { error } = await supabase
      .from("pet_vaccinations")
      .update(dbUpdates)
      .eq("id", recordId)

    if (error) {
      console.error("Failed to update vet record:", error)
      return
    }

    setPets((prev) => prev.map((p) => 
      p.id === petId 
        ? {
            ...p,
            vetRecords: p.vetRecords.map((r) => r.id === recordId ? { ...r, ...updates } : r),
            updatedAt: new Date().toISOString(),
          }
        : p
    ))
  }, [userId])

  const deleteVetRecord = useCallback(async (petId: string, recordId: string) => {
    if (!userId) return

    const supabase = createClient()
    const { error } = await supabase
      .from("pet_vaccinations")
      .delete()
      .eq("id", recordId)

    if (error) {
      console.error("Failed to delete vet record:", error)
      return
    }

    setPets((prev) => prev.map((p) => 
      p.id === petId 
        ? { ...p, vetRecords: p.vetRecords.filter((r) => r.id !== recordId), updatedAt: new Date().toISOString() }
        : p
    ))
  }, [userId])

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
    isSyncing,
    isAuthenticated: !!userId,
    addPet,
    updatePet,
    deletePet,
    addVetRecord,
    updateVetRecord,
    deleteVetRecord,
    getUpcomingVetVisits,
  }
}
