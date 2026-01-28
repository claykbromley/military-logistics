import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A"
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export interface Property {
  id: string
  propertyName: string
  propertyType: string
  address?: string
  make?: string
  model?: string
  year?: number
  vin?: string
  licensePlate?: string
  insuranceCompany?: string
  insurancePolicyNumber?: string
  insuranceExpiry?: string
  registrationExpiry?: string
  inspectionExpiry?: string
  caretakerName?: string
  caretakerPhone?: string
  caretakerEmail?: string
  notes?: string
  maintenanceTasks: MaintenanceTask[]
}

export interface MaintenanceTask {
  id: string
  taskName: string
  nextDue?: string
  assignedToName?: string
  isCompleted?: boolean
}

export interface ExpiringItem {
  propertyName: string
  type: string
  date: string
}

export interface SummaryData {
  properties: Property[]
  vehicles: Property[]
  upcomingTasks: (MaintenanceTask & { propertyName: string })[]
  expiringItems: ExpiringItem[]
}

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  overviewRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  propertyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  taskItem: {
    marginLeft: 10,
    marginBottom: 3,
  },
  expiringItem: {
    marginBottom: 5,
  },
  maintenanceItem: {
    marginBottom: 8,
  },
  maintenanceDetail: {
    fontSize: 10,
    color: '#666',
    marginLeft: 10,
  },
})

export const PropertySummaryDocument = ({ data }: { data: SummaryData }) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      <Text style={styles.title}>Property & Vehicle Summary</Text>
      <Text style={styles.subtitle}>
        Generated: {formatDate(new Date().toISOString())}
      </Text>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.overviewRow}>
        <Text style={styles.bold}>Total Properties: </Text>
        <Text>{data.properties.length}</Text>
      </View>
      <View style={styles.overviewRow}>
        <Text style={styles.bold}>Vehicles: </Text>
        <Text>{data.vehicles.length}</Text>
      </View>
      <View style={styles.overviewRow}>
        <Text style={styles.bold}>Upcoming Maintenance: </Text>
        <Text>{data.upcomingTasks.length}</Text>
      </View>
      <View style={styles.overviewRow}>
        <Text style={styles.bold}>Items Expiring Soon: </Text>
        <Text>{data.expiringItems.length}</Text>
      </View>

      {data.expiringItems.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Items Expiring Soon</Text>
          {data.expiringItems.map((item, index) => (
            <View key={index} style={styles.expiringItem}>
              <Text>
                <Text style={styles.bold}>{item.propertyName}</Text>
                {' — '}
                {item.type} ({formatDate(item.date)})
              </Text>
            </View>
          ))}
        </>
      )}

      {data.upcomingTasks.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Upcoming Maintenance</Text>
          {data.upcomingTasks.map((task, index) => (
            <View key={index} style={styles.maintenanceItem}>
              <Text>
                <Text style={styles.bold}>{task.propertyName}</Text>
                {' — '}
                {task.taskName}
              </Text>
              <Text style={styles.maintenanceDetail}>
                Due: {formatDate(task.nextDue)} | Assigned: {task.assignedToName || 'Unassigned'}
              </Text>
            </View>
          ))}
        </>
      )}
    </Page>

    <Page size="LETTER" style={styles.page}>
      <Text style={styles.sectionTitle}>Property Details</Text>
      
      {data.properties.map((prop, index) => (
        <View key={prop.id} style={{ marginTop: index > 0 ? 15 : 0 }}>
          <Text style={styles.propertyTitle}>{prop.propertyName}</Text>
          
          {prop.propertyType && (
            <View style={styles.detailRow}>
              <Text style={styles.bold}>Type: </Text>
              <Text>{prop.propertyType}</Text>
            </View>
          )}
          
          {prop.address && (
            <View style={styles.detailRow}>
              <Text style={styles.bold}>Address: </Text>
              <Text>{prop.address}</Text>
            </View>
          )}
          
          {prop.make && prop.model && prop.year && (
            <View style={styles.detailRow}>
              <Text style={styles.bold}>Vehicle: </Text>
              <Text>{prop.year} {prop.make} {prop.model}</Text>
            </View>
          )}
          
          {prop.vin && (
            <View style={styles.detailRow}>
              <Text style={styles.bold}>VIN: </Text>
              <Text>{prop.vin}</Text>
            </View>
          )}
          
          {prop.licensePlate && (
            <View style={styles.detailRow}>
              <Text style={styles.bold}>License Plate: </Text>
              <Text>{prop.licensePlate}</Text>
            </View>
          )}
          
          {prop.insuranceCompany && (
            <View style={styles.detailRow}>
              <Text style={styles.bold}>Insurance: </Text>
              <Text>{prop.insuranceCompany}</Text>
            </View>
          )}
          
          {prop.notes && (
            <View style={styles.detailRow}>
              <Text style={styles.bold}>Notes: </Text>
              <Text>{prop.notes}</Text>
            </View>
          )}
          
          {prop.maintenanceTasks && prop.maintenanceTasks.length > 0 && (
            <>
              <Text style={[styles.bold, { marginTop: 5 }]}>Maintenance Tasks:</Text>
              {prop.maintenanceTasks.map((task, taskIndex) => (
                <Text key={taskIndex} style={styles.taskItem}>
                  • {task.taskName} ({formatDate(task.nextDue)})
                </Text>
              ))}
            </>
          )}
        </View>
      ))}
    </Page>
  </Document>
)