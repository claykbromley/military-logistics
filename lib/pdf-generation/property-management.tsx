import { Document, Page, Text, View, StyleSheet, Svg, Path, Circle, Rect, G } from '@react-pdf/renderer'

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

// Warm color palette matching the UI
const colors = {
  primary: '#F59E0B',      // Amber 500
  primaryDark: '#D97706',  // Amber 600
  primaryLight: '#FEF3C7', // Amber 100
  stone800: '#292524',
  stone700: '#44403C',
  stone600: '#57534E',
  stone500: '#78716C',
  stone400: '#A8A29E',
  stone200: '#E7E5E4',
  stone100: '#F5F5F4',
  stone50: '#FAFAF9',
  white: '#FFFFFF',
  rose500: '#F43F5E',
  rose100: '#FFE4E6',
  emerald500: '#10B981',
  emerald100: '#D1FAE5',
  blue500: '#3B82F6',
  violet500: '#8B5CF6',
}

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: colors.white,
  },
  
  // Header styles
  header: {
    marginBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 40,
    height: 40,
  },
  titleContainer: {
    gap: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.stone800,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 10,
    color: colors.stone500,
  },
  dateBox: {
    backgroundColor: colors.stone100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 9,
    color: colors.stone600,
  },
  headerDivider: {
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  
  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.stone50,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.stone200,
  },
  statCardAccent: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 14,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.stone800,
    marginBottom: 2,
  },
  statValueLight: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    color: colors.stone500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statLabelLight: {
    fontSize: 9,
    color: colors.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Section styles
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionIcon: {
    width: 20,
    height: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.stone800,
  },
  sectionTitleSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.stone700,
  },
  
  // Alert box styles
  alertBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  alertTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryDark,
  },
  alertText: {
    fontSize: 9,
    color: colors.stone700,
    flex: 1,
  },
  
  // Task list styles
  taskList: {
    backgroundColor: colors.stone50,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.stone200,
  },
  taskItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.stone200,
  },
  taskItemLast: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  taskBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 10,
    marginTop: 3,
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.stone800,
    marginBottom: 2,
  },
  taskMeta: {
    fontSize: 8,
    color: colors.stone500,
  },
  
  // Property card styles
  propertyCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.stone200,
    overflow: 'hidden',
  },
  propertyCardAccent: {
    height: 4,
    backgroundColor: colors.primary,
  },
  propertyCardAccentVehicle: {
    height: 4,
    backgroundColor: colors.blue500,
  },
  propertyCardAccentRental: {
    height: 4,
    backgroundColor: colors.violet500,
  },
  propertyCardContent: {
    padding: 14,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  propertyName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.stone800,
    marginBottom: 2,
  },
  propertyAddress: {
    fontSize: 9,
    color: colors.stone500,
  },
  propertyType: {
    backgroundColor: colors.stone100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  propertyTypeText: {
    fontSize: 8,
    color: colors.stone600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  propertyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  propertyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.stone50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  propertyDetailLabel: {
    fontSize: 8,
    color: colors.stone500,
  },
  propertyDetailValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.stone700,
  },
  
  // Maintenance section within property
  propertyMaintenance: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.stone100,
  },
  maintenanceTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.stone600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  maintenanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  maintenanceDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.stone400,
  },
  maintenanceText: {
    fontSize: 9,
    color: colors.stone600,
    flex: 1,
  },
  maintenanceDate: {
    fontSize: 8,
    color: colors.stone400,
  },
  
  // Notes
  notesBox: {
    backgroundColor: colors.stone50,
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.stone500,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: colors.stone600,
    lineHeight: 1.4,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.stone200,
  },
  footerText: {
    fontSize: 8,
    color: colors.stone400,
  },
  pageNumber: {
    fontSize: 8,
    color: colors.stone500,
    fontWeight: 'bold',
  },
  
  // Page 2 title
  page2Header: {
    marginBottom: 20,
  },
  page2Title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.stone800,
    marginBottom: 4,
  },
  page2Subtitle: {
    fontSize: 10,
    color: colors.stone500,
  },
  page2Divider: {
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
    marginTop: 12,
    width: 60,
  },
})

// Icon components using SVG
const HomeIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path
      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      stroke={colors.primary}
      strokeWidth="2"
      fill="none"
    />
    <Path
      d="M9 22V12h6v10"
      stroke={colors.primary}
      strokeWidth="2"
      fill="none"
    />
  </Svg>
)

const AlertIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24">
    <Path
      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
      stroke={colors.primaryDark}
      strokeWidth="2"
      fill={colors.primaryLight}
    />
    <Path d="M12 9v4" stroke={colors.primaryDark} strokeWidth="2" />
    <Circle cx="12" cy="17" r="1" fill={colors.primaryDark} />
  </Svg>
)

const WrenchIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24">
    <Path
      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
      stroke={colors.stone600}
      strokeWidth="2"
      fill="none"
    />
  </Svg>
)

const LogoIcon = () => (
  <Svg width="40" height="40" viewBox="0 0 40 40">
    <Rect x="0" y="0" width="40" height="40" rx="10" fill={colors.primary} />
    <G>
      <Path
        d="M10 18l10-8 10 8v12a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2z"
        stroke={colors.white}
        strokeWidth="2"
        fill="none"
      />
      <Path
        d="M16 30V22h8v8"
        stroke={colors.white}
        strokeWidth="2"
        fill="none"
      />
    </G>
  </Svg>
)

function getPropertyAccentStyle(type: string) {
  switch (type) {
    case 'vehicle':
      return styles.propertyCardAccentVehicle
    case 'rental':
      return styles.propertyCardAccentRental
    default:
      return styles.propertyCardAccent
  }
}

function formatPropertyType(type: string): string {
  const types: Record<string, string> = {
    home: 'Home',
    rental: 'Rental',
    vehicle: 'Vehicle',
    storage: 'Storage',
    other: 'Other',
  }
  return types[type] || type
}

export const PropertySummaryDocument = ({ data }: { data: SummaryData }) => (
  <Document>
    {/* Page 1: Overview */}
    <Page size="LETTER" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <LogoIcon />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Property Summary</Text>
              <Text style={styles.subtitle}>Comprehensive overview of your properties & maintenance</Text>
            </View>
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.dateText}>Generated {formatDate(new Date().toISOString())}</Text>
          </View>
        </View>
        <View style={styles.headerDivider} />
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data.properties.length}</Text>
          <Text style={styles.statLabel}>Properties</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data.vehicles.length}</Text>
          <Text style={styles.statLabel}>Vehicles</Text>
        </View>
        <View style={styles.statCardAccent}>
          <Text style={styles.statValueLight}>{data.upcomingTasks.length}</Text>
          <Text style={styles.statLabelLight}>Tasks Due</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data.expiringItems.length}</Text>
          <Text style={styles.statLabel}>Expiring</Text>
        </View>
      </View>

      {/* Expiring Items Alert */}
      {data.expiringItems.length > 0 && (
        <View style={styles.section}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>⚠️  Items Requiring Attention</Text>
            {data.expiringItems.map((item, index) => (
              <View key={index} style={styles.alertItem}>
                <View style={styles.alertDot} />
                <Text style={styles.alertText}>
                  {item.propertyName} — {item.type} expires {formatDate(item.date+"T00:00:00")}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Upcoming Maintenance */}
      {data.upcomingTasks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <WrenchIcon />
            <Text style={styles.sectionTitle}>Upcoming Maintenance</Text>
          </View>
          <View style={styles.taskList}>
            {data.upcomingTasks.slice(0, 8).map((task, index) => (
              <View 
                key={index} 
                style={index === Math.min(data.upcomingTasks.length - 1, 7) ? styles.taskItemLast : styles.taskItem}
              >
                <View style={styles.taskBullet} />
                <View style={styles.taskContent}>
                  <Text style={styles.taskName}>{task.taskName}</Text>
                  <Text style={styles.taskMeta}>
                    {task.propertyName}  •  Due: {formatDate(task.nextDue+"T00:00:00")}
                    {task.assignedToName ? `  •  Assigned: ${task.assignedToName}` : ''}
                  </Text>
                </View>
              </View>
            ))}
            {data.upcomingTasks.length > 8 && (
              <Text style={{ fontSize: 9, color: colors.stone400, marginTop: 8, textAlign: 'center' }}>
                + {data.upcomingTasks.length - 8} more tasks
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>Property & Vehicle Manager</Text>
        <Text style={styles.pageNumber}>Page 1</Text>
      </View>
    </Page>

    {/* Page 2: Property Details */}
    <Page size="LETTER" style={styles.page}>
      <View style={styles.page2Header}>
        <Text style={styles.page2Title}>Property Details</Text>
        <Text style={styles.page2Subtitle}>
          Complete information for all {data.properties.length} registered properties
        </Text>
        <View style={styles.page2Divider} />
      </View>
      
      {data.properties.map((prop, index) => (
        <View key={prop.id} style={styles.propertyCard} wrap={false}>
          <View style={getPropertyAccentStyle(prop.propertyType)} />
          <View style={styles.propertyCardContent}>
            <View style={styles.propertyHeader}>
              <View>
                <Text style={styles.propertyName}>{prop.propertyName}</Text>
                {prop.address && (
                  <Text style={styles.propertyAddress}>{prop.address}</Text>
                )}
              </View>
              <View style={styles.propertyType}>
                <Text style={styles.propertyTypeText}>
                  {formatPropertyType(prop.propertyType)}
                </Text>
              </View>
            </View>
            
            <View style={styles.propertyDetails}>
              {prop.insuranceCompany && (
                <View style={styles.propertyDetail}>
                  <Text style={styles.propertyDetailLabel}>Insurance:</Text>
                  <Text style={styles.propertyDetailValue}>{prop.insuranceCompany}</Text>
                </View>
              )}
              {prop.insurancePolicyNumber && (
                <View style={styles.propertyDetail}>
                  <Text style={styles.propertyDetailLabel}>Policy #:</Text>
                  <Text style={styles.propertyDetailValue}>{prop.insurancePolicyNumber}</Text>
                </View>
              )}
              {prop.insuranceExpiry && (
                <View style={styles.propertyDetail}>
                  <Text style={styles.propertyDetailLabel}>Expires:</Text>
                  <Text style={styles.propertyDetailValue}>{formatDate(prop.insuranceExpiry+"T00:00:00")}</Text>
                </View>
              )}
              {prop.caretakerName && (
                <View style={styles.propertyDetail}>
                  <Text style={styles.propertyDetailLabel}>Caretaker:</Text>
                  <Text style={styles.propertyDetailValue}>
                    {prop.caretakerName}
                    {prop.caretakerPhone ? ` (${prop.caretakerPhone})` : ''}
                  </Text>
                </View>
              )}
              {prop.vin && (
                <View style={styles.propertyDetail}>
                  <Text style={styles.propertyDetailLabel}>VIN:</Text>
                  <Text style={styles.propertyDetailValue}>{prop.vin}</Text>
                </View>
              )}
              {prop.licensePlate && (
                <View style={styles.propertyDetail}>
                  <Text style={styles.propertyDetailLabel}>Plate:</Text>
                  <Text style={styles.propertyDetailValue}>{prop.licensePlate}</Text>
                </View>
              )}
              {prop.registrationExpiry && (
                <View style={styles.propertyDetail}>
                  <Text style={styles.propertyDetailLabel}>Registration:</Text>
                  <Text style={styles.propertyDetailValue}>{formatDate(prop.registrationExpiry+"T00:00:00")}</Text>
                </View>
              )}
              {prop.inspectionExpiry && (
                <View style={styles.propertyDetail}>
                  <Text style={styles.propertyDetailLabel}>Inspection:</Text>
                  <Text style={styles.propertyDetailValue}>{formatDate(prop.inspectionExpiry+"T00:00:00")}</Text>
                </View>
              )}
            </View>

            {prop.notes && (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>Notes</Text>
                <Text style={styles.notesText}>{prop.notes}</Text>
              </View>
            )}

            {prop.maintenanceTasks && prop.maintenanceTasks.length > 0 && (
              <View style={styles.propertyMaintenance}>
                <Text style={styles.maintenanceTitle}>
                  Pending Maintenance ({prop.maintenanceTasks.length})
                </Text>
                {prop.maintenanceTasks.slice(0, 4).map((task, taskIndex) => (
                  <View key={taskIndex} style={styles.maintenanceItem}>
                    <View style={styles.maintenanceDot} />
                    <Text style={styles.maintenanceText}>{task.taskName}</Text>
                    {task.nextDue && (
                      <Text style={styles.maintenanceDate}>{formatDate(task.nextDue+"T00:00:00")}</Text>
                    )}
                  </View>
                ))}
                {prop.maintenanceTasks.length > 4 && (
                  <Text style={{ fontSize: 8, color: colors.stone400, marginLeft: 10 }}>
                    + {prop.maintenanceTasks.length - 4} more
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      ))}

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>Property & Vehicle Manager</Text>
        <Text style={styles.pageNumber}>Page 2</Text>
      </View>
    </Page>
  </Document>
)