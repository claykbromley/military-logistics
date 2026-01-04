"use client"

import { Header } from "@/components/header"
import LocationForm from "@/components/location-form"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import { DiscountMap } from "@/components/discount-map"

type MapCenter = {
  lat: number
  lng: number
}

type MapDefaults = {
  center: MapCenter
  zoom: number
}

export default function RetailDiscountsPage(): JSX.Element {
  const defaultProps: MapDefaults = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627,
    },
    zoom: 11,
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Container fluid>
              <Row>
                <h1 className="text-3xl font-bold mb-4 text-center">
                  Discount Database
                </h1>
              </Row>

              <Row className="flex justify-center items-center my-6">
                {/* Map */}
                <DiscountMap />
              </Row>

              <Row className="flex justify-center items-center my-6">
                <LocationForm
                  onSubmit={(data: unknown) =>
                    console.log("Location submitted:", data)
                  }
                />
              </Row>
            </Container>
          </div>
        </div>
      </main>
    </>
  )
}
