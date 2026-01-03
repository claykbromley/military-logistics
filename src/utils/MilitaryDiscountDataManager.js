// Military Discount Data Manager
// Handles multiple data sources: verified chains, user submissions, and web scraping

class MilitaryDiscountDataManager {
  constructor() {
    this.verificationSources = {
      "target": { source: "Target Corporate", url: "target.com/circle/military", verifiedDate: "2024-06" },
      "home depot": { source: "Home Depot Corporate", url: "corporate.homedepot.com", verifiedDate: "2025-05" },
      "nike": { source: "Nike Military", url: "nike.com/help/a/military-discount", verifiedDate: "2024-12" },
      "under armour": { source: "Under Armour Military", url: "underarmour.com/en-us/t/troop-id-instructions.html", verifiedDate: "2024-12" },
      "foot locker": { source: "Foot Locker Military", url: "footlocker.com/help/militarydiscount", verifiedDate: "2024-12" }
    };

    this.verifiedChains = {
      // RESTAURANTS - Only verified with current corporate policies
      "applebee's": { discount: "Free Veterans Day meal", category: "restaurant", verification: "verified", note: "Veterans Day only" },
      "chili's": { discount: "Free Veterans Day meal", category: "restaurant", verification: "verified", note: "Veterans Day only" },
      "outback steakhouse": { discount: "10% off year-round", category: "restaurant", verification: "verified", note: "Plus Veterans Day free meal" },
      "buffalo wild wings": { discount: "10% off at participating locations", category: "restaurant", verification: "verified", note: "Location-dependent" },
      "denny's": { discount: "Free Grand Slam on Veterans Day", category: "restaurant", verification: "verified", note: "Veterans Day only" },
      "ihop": { discount: "Free pancake combo on Veterans Day", category: "restaurant", verification: "verified", note: "Veterans Day only" },
      "golden corral": { discount: "Free Veterans Day buffet", category: "restaurant", verification: "verified", note: "Plus year-round 10-20% at participating locations" },
      "texas roadhouse": { discount: "Free Veterans Day meal voucher", category: "restaurant", verification: "verified", note: "Veterans Day only" },
      
      // RETAIL - Only verified with current corporate policies  
      "the home depot": { discount: "10% off year-round", category: "retail", verification: "verified", note: "Excludes appliances" },
      "home depot": { discount: "10% off year-round", category: "retail", verification: "verified", note: "Excludes appliances" },
      "lowe's": { discount: "10% off year-round", category: "retail", verification: "verified" },
      "target": { discount: "10% off during military events", category: "retail", verification: "verified", note: "Limited time events only" },
      "gap": { discount: "10% off factory stores only", category: "retail", verification: "verified", note: "Factory stores only" },
      "under armour": { discount: "20% off year-round", category: "retail", verification: "verified", note: "ID.me verification required" },
      "nike": { discount: "10% off year-round", category: "retail", verification: "verified", note: "Online verification required" },
      "foot locker": { discount: "10% off most purchases", category: "retail", verification: "verified", note: "Restrictions apply" },
      
      // AUTOMOTIVE - Only verified with current corporate policies
      "jiffy lube": { discount: "15% off year-round", category: "automotive", verification: "verified", note: "Participating Team Car Care locations only" },
      "valvoline": { discount: "15% off year-round", category: "automotive", verification: "verified", note: "Excludes battery replacement/state inspection" },
      "meineke": { discount: "Free Veterans Day oil change", category: "automotive", verification: "verified", note: "Veterans Day only" },
      "firestone": { discount: "10% off year-round", category: "automotive", verification: "verified", note: "Tax-free advantages available" },
      
      // HOTELS - Only verified with current corporate policies
      "hampton inn": { discount: "10% off government rate", category: "hotel", verification: "verified", note: "Military ID required" },
      "marriott": { discount: "15% off flexible rates", category: "hotel", verification: "verified", note: "Participating resorts, code XYD" },
      "hilton": { discount: "Military family rate", category: "hotel", verification: "verified", note: "Varies by hotel, military ID required" },
      "holiday inn": { discount: "5%+ off best flexible rate", category: "hotel", verification: "verified", note: "Minimum 5% discount" },
      "best western": { discount: "10% off + per diem rates", category: "hotel", verification: "verified", note: "Military/government personnel" },
      "la quinta inn": { discount: "12% off standard rate", category: "hotel", verification: "verified", note: "Military ID required" },
      "motel 6": { discount: "10% off year-round", category: "hotel", verification: "verified", note: "All 1,400+ locations" },
      
      // ENTERTAINMENT/FITNESS - Only verified with current corporate policies
      "24 hour fitness": { discount: "$0 initiation + $5 off monthly", category: "entertainment", verification: "verified", note: "Select memberships, military ID required" }
    };

    this.dataSources = {
      verified: this.verifiedChains,
      user_submissions: {},
      scraped: {}
    };

    this.loadUserSubmissions();
    this.loadScrapedData();
  }

  // Load user submissions from localStorage
  loadUserSubmissions() {
    try {
      const submissions = localStorage.getItem('military_discount_user_submissions');
      if (submissions) {
        this.dataSources.user_submissions = JSON.parse(submissions);
      }
    } catch (error) {
      console.error('Error loading user submissions:', error);
    }
  }

  // Save user submissions to localStorage
  saveUserSubmissions() {
    try {
      localStorage.setItem('military_discount_user_submissions', JSON.stringify(this.dataSources.user_submissions));
    } catch (error) {
      console.error('Error saving user submissions:', error);
    }
  }

  // Load scraped data from localStorage
  loadScrapedData() {
    try {
      const scraped = localStorage.getItem('military_discount_scraped_data');
      if (scraped) {
        this.dataSources.scraped = JSON.parse(scraped);
      }
    } catch (error) {
      console.error('Error loading scraped data:', error);
    }
  }

  // Save scraped data to localStorage
  saveScrapedData() {
    try {
      localStorage.setItem('military_discount_scraped_data', JSON.stringify(this.dataSources.scraped));
    } catch (error) {
      console.error('Error saving scraped data:', error);
    }
  }

  // Add user submission
  addUserSubmission(businessData) {
    const id = this.generateId();
    const submission = {
      ...businessData,
      id,
      source: 'user_submission',
      verification: 'pending',
      submittedAt: new Date().toISOString(),
      status: 'pending' // pending, approved, rejected
    };

    this.dataSources.user_submissions[id] = submission;
    this.saveUserSubmissions();
    return submission;
  }

  // Approve user submission
  approveSubmission(id) {
    if (this.dataSources.user_submissions[id]) {
      this.dataSources.user_submissions[id].verification = 'user_approved';
      this.dataSources.user_submissions[id].status = 'approved';
      this.dataSources.user_submissions[id].approvedAt = new Date().toISOString();
      this.saveUserSubmissions();
      return true;
    }
    return false;
  }

  // Reject user submission
  rejectSubmission(id) {
    if (this.dataSources.user_submissions[id]) {
      this.dataSources.user_submissions[id].status = 'rejected';
      this.dataSources.user_submissions[id].rejectedAt = new Date().toISOString();
      this.saveUserSubmissions();
      return true;
    }
    return false;
  }

  // Get all pending submissions
  getPendingSubmissions() {
    return Object.values(this.dataSources.user_submissions).filter(
      sub => sub.status === 'pending'
    );
  }

  // Get approved submissions
  getApprovedSubmissions() {
    return Object.values(this.dataSources.user_submissions).filter(
      sub => sub.status === 'approved'
    );
  }

  // Add scraped data
  addScrapedData(businessData) {
    const id = this.generateId();
    const scraped = {
      ...businessData,
      id,
      source: 'scraped',
      verification: 'scraped',
      scrapedAt: new Date().toISOString()
    };

    this.dataSources.scraped[id] = scraped;
    this.saveScrapedData();
    return scraped;
  }

  // Match business name against known chains
  matchKnownChain(businessName) {
    const nameLower = businessName.toLowerCase().trim();
    
    // Direct match
    if (this.verifiedChains[nameLower]) {
      return { ...this.verifiedChains[nameLower], name: businessName, source: 'verified' };
    }
    
    // Partial matching
    for (const [chainName, info] of Object.entries(this.verifiedChains)) {
      if (nameLower === chainName || 
          nameLower.startsWith(chainName + " ") || 
          nameLower.endsWith(" " + chainName) ||
          nameLower.includes(" " + chainName + " ")) {
        return { ...info, name: businessName, source: 'verified' };
      }
    }
    
    return null;
  }

  // Search for business by name across all sources
  searchBusiness(businessName) {
    const nameLower = businessName.toLowerCase().trim();
    
    // Check verified chains first
    const verifiedMatch = this.matchKnownChain(businessName);
    if (verifiedMatch) {
      // Add verification source info
      const matchKey = Object.keys(this.verifiedChains).find(key => 
        nameLower.includes(key) || key.includes(nameLower)
      );
      if (matchKey && this.verificationSources[matchKey]) {
        verifiedMatch.verificationSource = this.verificationSources[matchKey];
      }
      return verifiedMatch;
    }

    // Check user submissions
    for (const submission of Object.values(this.dataSources.user_submissions)) {
      if (submission.status === 'approved' && 
          submission.name.toLowerCase().trim() === nameLower) {
        return submission;
      }
    }

    // Check scraped data
    for (const scraped of Object.values(this.dataSources.scraped)) {
      if (scraped.name.toLowerCase().trim() === nameLower) {
        return scraped;
      }
    }

    return null;
  }

  // Get verification details for a business
  getVerificationDetails(businessName) {
    const nameLower = businessName.toLowerCase().trim();
    const matchKey = Object.keys(this.verifiedChains).find(key => 
      nameLower.includes(key) || key.includes(nameLower)
    );
    
    if (matchKey && this.verificationSources[matchKey]) {
      return this.verificationSources[matchKey];
    }
    
    return null;
  }

  // Check if a discount has been recently verified
  isRecentlyVerified(businessName, monthsOld = 6) {
    const details = this.getVerificationDetails(businessName);
    if (!details) return false;
    
    const verificationDate = new Date(details.verifiedDate);
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld);
    
    return verificationDate > cutoffDate;
  }

// Get all businesses for a location
  getBusinessesForLocation(location, category = 'all') {
    const allBusinesses = [
      // User submissions
      ...this.getApprovedSubmissions().filter(b => category === 'all' || b.category === category),
      // Scraped data
      ...Object.values(this.dataSources.scraped).filter(b => category === 'all' || b.category === category)
    ];
    return allBusinesses;
  }

  // Get cache statistics
  getCacheStatistics() {
    const zipCodes = [];
    let totalBusinesses = 0;
    let cacheHits = 0;
    let cacheMisses = 0;

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('military_discount_zip_')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (parsed.length > 0) {
              zipCodes.push(key.replace('military_discount_zip_', ''));
              totalBusinesses += parsed.length;
              cacheHits += parsed.length;
            }
          } catch (e) {
            // Invalid data, remove it
            localStorage.removeItem(key);
          }
        }
      }
    });

    return {
      cachedZIPCodes: zipCodes.length,
      totalCachedBusinesses: totalBusinesses,
      cacheHits: cacheHits,
      estimatedSize: JSON.stringify(localStorage).length
    };
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get data source statistics
  getDataSourceStats() {
    return {
      verified: Object.keys(this.verifiedChains).length,
      user_submissions: {
        total: Object.keys(this.dataSources.user_submissions).length,
        pending: this.getPendingSubmissions().length,
        approved: this.getApprovedSubmissions().length
      },
      scraped: Object.keys(this.dataSources.scraped).length
    };
  }

  // Web scraping methods
  async scrapeVeteranCom() {
    try {
      // This would be implemented with a backend service
      // For now, we'll add a placeholder
      console.log('Web scraping veteran.com - would require backend implementation');
      return [];
    } catch (error) {
      console.error('Error scraping veteran.com:', error);
      return [];
    }
  }

  async scrapeMilitaryDiscountsList() {
    try {
      // This would be implemented with a backend service
      console.log('Web scraping militarydiscountlist.org - would require backend implementation');
      return [];
    } catch (error) {
      console.error('Error scraping militarydiscountlist.org:', error);
      return [];
    }
  }
}

export default MilitaryDiscountDataManager;