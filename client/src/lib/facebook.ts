import { Vehicle } from "@shared/schema";

export interface FacebookPostContent {
  title: string;
  description: string;
  price: string;
  features: string[];
  hashtags: string[];
  emojis: string[];
}

export class FacebookIntegration {
  static generatePostContent(vehicle: Vehicle): FacebookPostContent {
    const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`;
    
    const features = vehicle.features || [];
    const hashtags = this.generateHashtags(vehicle);
    const emojis = this.selectEmojis(vehicle);
    
    const description = this.buildDescription(vehicle, features);

    return {
      title,
      description,
      price: `$${vehicle.price}`,
      features,
      hashtags,
      emojis,
    };
  }

  static buildDescription(vehicle: Vehicle, features: string[]): string {
    const parts: string[] = [];
    
    // Main vehicle info
    parts.push(`${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`);
    parts.push(`💰 Price: $${vehicle.price}`);
    parts.push(`📊 Mileage: ${vehicle.mileage.toLocaleString()} miles`);
    
    if (vehicle.transmission) {
      parts.push(`⚙️ Transmission: ${vehicle.transmission}`);
    }
    
    if (vehicle.fuelType) {
      parts.push(`⛽ Fuel Type: ${vehicle.fuelType}`);
    }
    
    if (vehicle.exteriorColor) {
      parts.push(`🎨 Exterior: ${vehicle.exteriorColor}`);
    }
    
    if (vehicle.interiorColor) {
      parts.push(`🪑 Interior: ${vehicle.interiorColor}`);
    }

    // Features
    if (features.length > 0) {
      parts.push('');
      parts.push('✨ Key Features:');
      features.slice(0, 8).forEach(feature => {
        parts.push(`• ${feature}`);
      });
    }

    // VIN
    parts.push('');
    parts.push(`🔍 VIN: ${vehicle.vin}`);
    
    // Dealer info
    if (vehicle.dealerName) {
      parts.push(`🏪 Dealer: ${vehicle.dealerName}`);
    }
    
    if (vehicle.dealerLocation) {
      parts.push(`📍 Location: ${vehicle.dealerLocation}`);
    }

    // Call to action
    parts.push('');
    parts.push('💬 Comment or message for more details!');
    parts.push('📱 Serious inquiries only');
    
    return parts.join('\n');
  }

  static generateHashtags(vehicle: Vehicle): string[] {
    const hashtags: string[] = [];
    
    // Vehicle specific
    hashtags.push(`#${vehicle.make.replace(/\s+/g, '')}`);
    hashtags.push(`#${vehicle.model.replace(/\s+/g, '')}`);
    hashtags.push(`#${vehicle.year}${vehicle.make.replace(/\s+/g, '')}`);
    
    if (vehicle.trim) {
      hashtags.push(`#${vehicle.trim.replace(/\s+/g, '')}`);
    }

    // General car hashtags
    hashtags.push('#UsedCars');
    hashtags.push('#CarForSale');
    hashtags.push('#AutoSales');
    hashtags.push('#QualityCars');
    
    // Condition based
    if (vehicle.mileage < 30000) {
      hashtags.push('#LowMileage');
    }
    
    if (vehicle.year >= new Date().getFullYear() - 3) {
      hashtags.push('#LikeNew');
      hashtags.push('#RecentModel');
    }
    
    // Price based
    const price = parseFloat(vehicle.price.toString());
    if (price < 15000) {
      hashtags.push('#Affordable');
      hashtags.push('#BudgetFriendly');
    } else if (price > 50000) {
      hashtags.push('#Luxury');
      hashtags.push('#Premium');
    }

    return hashtags.slice(0, 15); // Limit to 15 hashtags
  }

  static selectEmojis(vehicle: Vehicle): string[] {
    const emojis: string[] = [];
    
    // Vehicle type emojis
    emojis.push('🚗');
    
    // Feature-based emojis
    const features = vehicle.features || [];
    if (features.some(f => f.toLowerCase().includes('leather'))) {
      emojis.push('🏆');
    }
    
    if (features.some(f => f.toLowerCase().includes('sunroof'))) {
      emojis.push('☀️');
    }
    
    if (features.some(f => f.toLowerCase().includes('navigation'))) {
      emojis.push('🗺️');
    }
    
    if (features.some(f => f.toLowerCase().includes('bluetooth'))) {
      emojis.push('📱');
    }
    
    // Condition emojis
    if (vehicle.mileage < 30000) {
      emojis.push('✨');
    }
    
    // General emojis
    emojis.push('💎', '🔥', '⭐');
    
    return emojis.slice(0, 8);
  }

  static formatPostForFacebook(content: FacebookPostContent, includeHashtags: boolean = true): string {
    let post = content.description;
    
    if (includeHashtags && content.hashtags.length > 0) {
      post += '\n\n' + content.hashtags.join(' ');
    }
    
    return post;
  }

  // Open Facebook groups for posting
  static openFacebookGroups(groupUrls: string[]): void {
    groupUrls.forEach((url, index) => {
      // Delay opening tabs to avoid being blocked
      setTimeout(() => {
        window.open(url, `_blank_${index}`);
      }, index * 500);
    });
  }

  // Check if Facebook is available
  static isFacebookAvailable(): boolean {
    // Check if we can access Facebook (not blocked, etc.)
    return typeof window !== 'undefined' && !window.location.href.includes('facebook.com');
  }

  // Generate Facebook Marketplace URL
  static generateMarketplaceUrl(vehicle: Vehicle): string {
    const baseUrl = 'https://www.facebook.com/marketplace/create/item';
    const params = new URLSearchParams({
      title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      price: vehicle.price.toString(),
      description: this.buildDescription(vehicle, vehicle.features || []),
    });
    
    return `${baseUrl}?${params.toString()}`;
  }
}

// Facebook groups management
export interface FacebookGroup {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  lastPostTime?: Date;
  memberCount?: number;
  postingRules?: string[];
}

export class FacebookGroupsManager {
  static getRecommendedGroups(): FacebookGroup[] {
    return [
      {
        id: '1',
        name: 'Used Cars for Sale - National',
        url: 'https://facebook.com/groups/usedcars',
        isActive: true,
        memberCount: 45000,
        postingRules: ['No dealers', 'Include price', 'Real photos only'],
      },
      {
        id: '2',
        name: 'Car Enthusiasts Buy/Sell',
        url: 'https://facebook.com/groups/carenthusiasts',
        isActive: true,
        memberCount: 32000,
        postingRules: ['Quality cars only', 'Detailed descriptions required'],
      },
      {
        id: '3',
        name: 'Local Auto Sales',
        url: 'https://facebook.com/groups/localautosales',
        isActive: true,
        memberCount: 18000,
        postingRules: ['Local sales only', 'Meet in public places'],
      },
    ];
  }

  static canPostToGroup(group: FacebookGroup, lastPostTime?: Date): boolean {
    if (!group.isActive) return false;
    
    if (lastPostTime) {
      const hoursSinceLastPost = (Date.now() - lastPostTime.getTime()) / (1000 * 60 * 60);
      // Don't post to same group within 24 hours
      return hoursSinceLastPost >= 24;
    }
    
    return true;
  }

  static selectGroupsForPosting(groups: FacebookGroup[], maxGroups: number = 3): FacebookGroup[] {
    const availableGroups = groups.filter(group => this.canPostToGroup(group));
    
    // Sort by member count and activity
    availableGroups.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
    
    return availableGroups.slice(0, maxGroups);
  }
}
