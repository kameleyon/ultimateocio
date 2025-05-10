// Auto-generated boilerplate for mock-data-inserter

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Data generation utilities
const loremIpsum = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl nec ultricies lacinia, 
tincidunt. Sed vitae nisl eget nisl tincidunt tincidunt. Nullam auctor, nisl nec ultricies lacinia,
nisl nunc egestas justo, vitae tincidunt nisl nunc vitae nisl.
`.trim().replace(/\s+/g, ' ');

export function activate() {
  console.log("[TOOL] mock-data-inserter activated");
}

/**
 * Handles file write events to detect parameters for data insertion
 */
export function onFileWrite(event: { path: string; content: string }) {
  // Not used in this tool
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Mock Data Inserter] Session started: ${session.id}`);
}

// Function declarations
/**
 * Handles generating mock data
 */
async function handleGenerateMockData(args: any) {
  try {
    const result = GenerateMockDataSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for generating mock data"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { type, count, customSchema, locale, seed, outputPath } = result.data;
    
    // Generate mock data
    const mockData = generateMockData(type, count, customSchema, seed, locale);
    
    // Write to file if output path is provided
    if (outputPath) {
      try {
        // Create directory if it doesn't exist
        const dir = path.dirname(outputPath);
        if (!fsSync.existsSync(dir)) {
          await fs.mkdir(dir, { recursive: true });
        }
        
        // Write to file
        await fs.writeFile(outputPath, JSON.stringify(mockData, null, 2));
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: String(error),
              message: "Failed to write mock data to file"
            }, null, 2)
          }],
          isError: true
        };
      }
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          type,
          count,
          locale,
          data: mockData.slice(0, 3), // Return only a preview of the data
          totalItems: mockData.length,
          hasMore: mockData.length > 3,
          outputPath: outputPath || null,
          message: `Successfully generated ${count} mock ${type} items`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to generate mock data"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles inserting mock data
 */
async function handleInsertMockData(args: any) {
  try {
    const result = InsertMockDataSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for inserting mock data"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { path: filePath, data, type, count, format, variable, customSchema } = result.data;
    
    // Generate or use provided mock data
    const mockData = data || (type ? generateMockData(type, count, customSchema) : []);
    
    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(filePath);
      if (!fsSync.existsSync(dir)) {
        await fs.mkdir(dir, { recursive: true });
      }
      
      // Format the data based on requested format
      let formattedContent = '';
      if (format === 'json') {
        formattedContent = JSON.stringify(mockData, null, 2);
      } else if (format === 'js') {
        const varName = variable || 'mockData';
        formattedContent = `const ${varName} = ${JSON.stringify(mockData, null, 2)};\n\nmodule.exports = ${varName};`;
      } else if (format === 'ts') {
        const varName = variable || 'mockData';
        formattedContent = `const ${varName} = ${JSON.stringify(mockData, null, 2)} as const;\n\nexport default ${varName};`;
      }
      
      // Write to file
      await fs.writeFile(filePath, formattedContent);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            path: filePath,
            format,
            count: mockData.length,
            message: `Successfully inserted ${mockData.length} items into ${filePath}`
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: String(error),
            message: "Failed to insert mock data"
          }, null, 2)
        }],
        isError: true
      };
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to insert mock data"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles listing available mock data templates
 */
async function handleListTemplates(args: any) {
  try {
    const result = ListTemplatesSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for listing templates"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { detailed } = result.data;
    
    // List of available templates
    const templates = [
      { name: 'user', description: 'User profile data with contact information' },
      { name: 'product', description: 'Product catalog items with pricing and details' },
      { name: 'post', description: 'Blog posts or articles with content and metadata' },
      { name: 'comment', description: 'User comments with threaded replies' },
      { name: 'address', description: 'Physical address information' },
      { name: 'transaction', description: 'Financial transactions with amounts and categories' },
      { name: 'event', description: 'Calendar events with dates and attendees' },
      { name: 'task', description: 'Project tasks with status and assignments' },
      { name: 'contact', description: 'Contact information with personal and professional details' }
    ];
    
    // If detailed, include example data
    if (detailed) {
      // Generate example data for each template type
      const examples: Record<string, any> = {};
      for (const template of templates) {
        examples[template.name] = generateMockData(template.name, 1)[0];
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            templates,
            examples,
            message: `Found ${templates.length} mock data templates`
          }, null, 2)
        }]
      };
    }
    
    // Simple list of templates
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          templates,
          message: `Found ${templates.length} mock data templates`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to list templates"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles customizing mock data
 */
async function handleCustomizeMockData(args: any) {
  try {
    const result = CustomizeMockDataSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for customizing mock data"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { template, overrides, count, outputPath } = result.data;
    
    // Generate base data
    const mockData = generateMockData(template, count);
    
    // Apply overrides to each item
    const customizedData = mockData.map(item => ({
      ...item,
      ...overrides
    }));
    
    // Write to file if output path is provided
    if (outputPath) {
      try {
        // Create directory if it doesn't exist
        const dir = path.dirname(outputPath);
        if (!fsSync.existsSync(dir)) {
          await fs.mkdir(dir, { recursive: true });
        }
        
        // Write to file
        await fs.writeFile(outputPath, JSON.stringify(customizedData, null, 2));
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: String(error),
              message: "Failed to write customized data to file"
            }, null, 2)
          }],
          isError: true
        };
      }
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          template,
          count: customizedData.length,
          overrides: Object.keys(overrides),
          data: customizedData.slice(0, 3), // Return only a preview of the data
          totalItems: customizedData.length,
          hasMore: customizedData.length > 3,
          outputPath: outputPath || null,
          message: `Successfully customized ${count} mock ${template} items`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to customize mock data"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles mock-data-inserter commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'mock-data-inserter:generate':
      console.log('[Mock Data Inserter] Generating mock data...');
      return await handleGenerateMockData(command.args[0]);
    case 'mock-data-inserter:insert':
      console.log('[Mock Data Inserter] Inserting mock data...');
      return await handleInsertMockData(command.args[0]);
    case 'mock-data-inserter:templates':
      console.log('[Mock Data Inserter] Listing templates...');
      return await handleListTemplates(command.args[0]);
    case 'mock-data-inserter:customize':
      console.log('[Mock Data Inserter] Customizing mock data...');
      return await handleCustomizeMockData(command.args[0]);
    default:
      console.warn(`[Mock Data Inserter] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Mock Data Inserter tool
export const GenerateMockDataSchema = z.object({
  type: z.enum([
    'user', 'product', 'post', 'comment', 'address', 
    'transaction', 'event', 'task', 'contact', 'custom'
  ]),
  count: z.number().optional().default(10),
  customSchema: z.record(z.any()).optional(),
  locale: z.string().optional().default('en-US'),
  seed: z.string().optional(),
  outputPath: z.string().optional(),
});

export const InsertMockDataSchema = z.object({
  path: z.string(),
  data: z.any().optional(),
  type: z.enum([
    'user', 'product', 'post', 'comment', 'address', 
    'transaction', 'event', 'task', 'contact', 'custom'
  ]).optional(),
  count: z.number().optional().default(10),
  format: z.enum(['json', 'js', 'ts']).optional().default('json'),
  variable: z.string().optional(),
  customSchema: z.record(z.any()).optional(),
});

export const ListTemplatesSchema = z.object({
  detailed: z.boolean().optional().default(false),
});

export const CustomizeMockDataSchema = z.object({
  template: z.enum([
    'user', 'product', 'post', 'comment', 'address', 
    'transaction', 'event', 'task', 'contact', 'custom'
  ]),
  overrides: z.record(z.any()),
  count: z.number().optional().default(1),
  outputPath: z.string().optional(),
});

/**
 * Generate a random integer within a range
 */
function getRandomInt(min: number, max: number, random = Math.random): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(random() * (max - min + 1)) + min;
}

/**
 * Generate a seeded random float between 0 and 1
 */
function seededRandom(seed: string): () => number {
  let s = crypto.createHash('sha256').update(seed).digest('hex');
  
  // Simple xorshift algorithm for pseudo-random generation
  return function() {
    // Convert the first 8 chars of seed to a number
    let n = parseInt(s.substr(0, 8), 16);
    
    // XORShift algorithm
    n ^= n << 13;
    n ^= n >> 17;
    n ^= n << 5;
    
    // Update the seed with the new value
    s = n.toString(16).padStart(8, '0') + s.substring(8);
    
    // Return a value between 0 and 1
    return (n >>> 0) / 4294967296;
  };
}

/**
 * Get random item from an array
 */
function getRandomItem<T>(array: T[], random = Math.random): T {
  return array[Math.floor(random() * array.length)];
}

/**
 * Generate user mock data
 */
function generateUserData(count: number, random = Math.random): any[] {
  const firstNames = [
    'James', 'John', 'Robert', 'Michael', 'William',
    'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth',
    'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
    'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
  ];
  
  const domains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'icloud.com', 'mail.com', 'protonmail.com', 'aol.com'
  ];
  
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = getRandomItem(firstNames, random);
    const lastName = getRandomItem(lastNames, random);
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${getRandomInt(1, 999, random)}`;
    const email = `${username}@${getRandomItem(domains, random)}`;
    
    users.push({
      id: i + 1,
      firstName,
      lastName,
      username,
      email,
      birthDate: new Date(
        getRandomInt(1960, 2000, random),
        getRandomInt(0, 11, random),
        getRandomInt(1, 28, random)
      ).toISOString().split('T')[0],
      address: {
        street: `${getRandomInt(100, 999, random)} ${getRandomItem(['Main', 'Oak', 'Pine', 'Maple', 'Cedar'], random)} ${getRandomItem(['St', 'Ave', 'Blvd', 'Rd', 'Ln'], random)}`,
        city: getRandomItem(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'], random),
        state: getRandomItem(['CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'], random),
        zipCode: getRandomInt(10000, 99999, random).toString(),
      },
      phone: `${getRandomInt(100, 999, random)}-${getRandomInt(100, 999, random)}-${getRandomInt(1000, 9999, random)}`,
      isActive: random() > 0.2,
      registeredAt: new Date(Date.now() - getRandomInt(1, 365, random) * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return users;
}

/**
 * Generate product mock data
 */
function generateProductData(count: number, random = Math.random): any[] {
  const categories = [
    'Electronics', 'Clothing', 'Books', 'Home & Garden',
    'Toys', 'Sports', 'Beauty', 'Automotive', 'Groceries'
  ];
  
  const adjectives = [
    'Premium', 'Deluxe', 'Ultimate', 'Essential', 'Classic',
    'Modern', 'Vintage', 'Professional', 'Advanced', 'Basic'
  ];
  
  const products = [
    'Laptop', 'Smartphone', 'Tablet', 'Headphones', 'Camera',
    'T-shirt', 'Jeans', 'Shoes', 'Jacket', 'Watch',
    'Chair', 'Table', 'Lamp', 'Desk', 'Sofa',
    'Book', 'Magazine', 'Notebook', 'Pen', 'Calendar'
  ];
  
  const brands = [
    'TechPro', 'StyleMaster', 'HomeEssentials', 'SportFusion',
    'GadgetWorld', 'ComfortZone', 'EcoFriendly', 'LuxuryLiving'
  ];
  
  const result = [];
  
  for (let i = 0; i < count; i++) {
    const name = `${getRandomItem(adjectives, random)} ${getRandomItem(products, random)}`;
    const category = getRandomItem(categories, random);
    const brand = getRandomItem(brands, random);
    const price = parseFloat((getRandomInt(999, 9999, random) / 100).toFixed(2));
    
    result.push({
      id: i + 1,
      name,
      description: `${name} by ${brand} - ${getRandomItem([
        'High-quality product for daily use',
        'Perfect for home and office',
        'Best selling item in its category',
        'Customer favorite with excellent reviews',
        'New and improved version'
      ], random)}`,
      category,
      brand,
      price,
      currency: 'USD',
      inStock: random() > 0.2,
      stockQuantity: getRandomInt(0, 1000, random),
      rating: parseFloat((random() * 4 + 1).toFixed(1)),
      tags: Array.from(
        { length: getRandomInt(1, 4, random) },
        () => getRandomItem(['new', 'sale', 'popular', 'featured', 'trending', 'seasonal', 'limited'], random)
      ),
      createdAt: new Date(Date.now() - getRandomInt(1, 365, random) * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return result;
}

/**
 * Generate post mock data
 */
function generatePostData(count: number, random = Math.random): any[] {
  const titles = [
    'Getting Started with React',
    'The Future of AI',
    '10 Tips for Productive Work',
    'Understanding JavaScript Promises',
    'A Guide to Modern UX Design',
    'Building Responsive Websites',
    'Introduction to Machine Learning',
    'Advanced CSS Techniques',
    'The Art of Public Speaking',
    'Healthy Eating Habits',
    'Financial Planning for Beginners',
    'Travel on a Budget',
    'Home Office Setup Guide',
    'Photography for Beginners',
    'Effective Time Management'
  ];
  
  const categories = [
    'Technology', 'Health', 'Finance', 'Travel', 
    'Lifestyle', 'Food', 'Fitness', 'Business', 'Education'
  ];
  
  const posts = [];
  
  for (let i = 0; i < count; i++) {
    const title = getRandomItem(titles, random);
    const paragraphCount = getRandomInt(2, 5, random);
    const content = Array.from({ length: paragraphCount }, () => {
      const sentenceCount = getRandomInt(3, 8, random);
      return Array.from({ length: sentenceCount }, () => {
        const start = getRandomInt(0, loremIpsum.length - 100, random);
        return loremIpsum.slice(start, start + getRandomInt(50, 100, random)) + '.';
      }).join(' ');
    }).join('\n\n');
    
    posts.push({
      id: i + 1,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      content,
      excerpt: content.slice(0, 150) + '...',
      authorId: getRandomInt(1, 20, random),
      category: getRandomItem(categories, random),
      tags: Array.from(
        { length: getRandomInt(1, 5, random) },
        () => getRandomItem(['webdev', 'tutorial', 'tips', 'guide', 'howto', 'review', 'opinion', 'news'], random)
      ),
      publishedAt: new Date(Date.now() - getRandomInt(1, 365, random) * 24 * 60 * 60 * 1000).toISOString(),
      views: getRandomInt(10, 10000, random),
      likes: getRandomInt(0, 500, random),
      featured: random() > 0.8
    });
  }
  
  return posts;
}

/**
 * Generate a mock dataset based on type
 */
function generateMockData(
  type: string,
  count: number,
  customSchema?: any,
  seed?: string,
  locale: string = 'en-US'
): any[] {
  // Use seeded random if seed is provided
  const random = seed ? seededRandom(seed) : Math.random;
  
  switch (type) {
    case 'user':
      return generateUserData(count, random);
    case 'product':
      return generateProductData(count, random);
    case 'post':
      return generatePostData(count, random);
    case 'comment':
      return generateCommentData(count, random);
    case 'address':
      return generateAddressData(count, random);
    case 'transaction':
      return generateTransactionData(count, random);
    case 'event':
      return generateEventData(count, random);
    case 'task':
      return generateTaskData(count, random);
    case 'contact':
      return generateContactData(count, random);
    case 'custom':
      if (!customSchema) {
        throw new Error('Custom schema is required for custom type');
      }
      return generateCustomData(customSchema, count, random);
    default:
      throw new Error(`Unknown data type: ${type}`);
  }
}

/**
 * Generate comment mock data
 */
function generateCommentData(count: number, random = Math.random): any[] {
  const comments = [];
  
  for (let i = 0; i < count; i++) {
    const start = getRandomInt(0, loremIpsum.length - 100, random);
    const text = loremIpsum.slice(start, start + getRandomInt(30, 150, random));
    
    comments.push({
      id: i + 1,
      text,
      authorId: getRandomInt(1, 50, random),
      postId: getRandomInt(1, 100, random),
      parentId: random() > 0.8 ? getRandomInt(1, 50, random) : null,
      createdAt: new Date(Date.now() - getRandomInt(1, 30, random) * 24 * 60 * 60 * 1000).toISOString(),
      likes: getRandomInt(0, 50, random),
      status: getRandomItem(['published', 'pending', 'spam'], random)
    });
  }
  
  return comments;
}

/**
 * Generate address mock data
 */
function generateAddressData(count: number, random = Math.random): any[] {
  const streets = ['Main St', 'Oak Ave', 'Park Blvd', 'Pine Rd', 'Cedar Ln', 'Maple Dr', 'Elm St'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio'];
  const states = ['CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
  const countries = ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'Japan'];
  
  const addresses = [];
  
  for (let i = 0; i < count; i++) {
    addresses.push({
      id: i + 1,
      street: `${getRandomInt(100, 9999, random)} ${getRandomItem(streets, random)}`,
      city: getRandomItem(cities, random),
      state: getRandomItem(states, random),
      zipCode: getRandomInt(10000, 99999, random).toString(),
      country: getRandomItem(countries, random),
      latitude: (random() * 180 - 90).toFixed(6),
      longitude: (random() * 360 - 180).toFixed(6),
      isDefault: random() > 0.8,
      type: getRandomItem(['home', 'work', 'billing', 'shipping'], random)
    });
  }
  
  return addresses;
}

/**
 * Generate transaction mock data
 */
function generateTransactionData(count: number, random = Math.random): any[] {
  const transactions = [];
  
  for (let i = 0; i < count; i++) {
    const amount = parseFloat((getRandomInt(100, 10000, random) / 100).toFixed(2));
    const isDebit = random() > 0.5;
    
    transactions.push({
      id: i + 1,
      userId: getRandomInt(1, 100, random),
      type: getRandomItem(['purchase', 'refund', 'transfer', 'payment', 'withdrawal', 'deposit'], random),
      amount: isDebit ? -amount : amount,
      currency: getRandomItem(['USD', 'EUR', 'GBP', 'JPY', 'CAD'], random),
      status: getRandomItem(['completed', 'pending', 'failed', 'disputed'], random),
      description: getRandomItem([
        'Online purchase',
        'Monthly subscription',
        'Service payment',
        'Refund for return',
        'Transfer to account',
        'Withdrawal from ATM'
      ], random),
      merchant: getRandomItem([
        'Amazon', 'Walmart', 'Netflix', 'Uber', 'Spotify',
        'Apple', 'Google', 'Microsoft', 'Target', 'Starbucks'
      ], random),
      category: getRandomItem([
        'shopping', 'entertainment', 'food', 'transport', 
        'utilities', 'health', 'education', 'travel'
      ], random),
      createdAt: new Date(Date.now() - getRandomInt(1, 90, random) * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return transactions;
}

/**
 * Generate event mock data
 */
function generateEventData(count: number, random = Math.random): any[] {
  const events = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  for (let i = 0; i < count; i++) {
    const startDate = new Date(
      year,
      month,
      getRandomInt(1, 28, random),
      getRandomInt(9, 19, random),
      getRandomInt(0, 59, random)
    );
    
    const durationHours = getRandomInt(1, 8, random);
    const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
    
    events.push({
      id: i + 1,
      title: getRandomItem([
        'Team Meeting', 'Project Review', 'Client Presentation',
        'Conference Call', 'Training Session', 'Product Launch',
        'Workshop', 'Webinar', 'Interview', 'Deadline'
      ], random),
      description: loremIpsum.slice(0, getRandomInt(50, 200, random)),
      location: getRandomItem([
        'Conference Room A', 'Main Office', 'Online/Virtual',
        'Client Office', 'Hotel Conference Center', 'Training Center'
      ], random),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      allDay: false,
      organizer: getRandomInt(1, 20, random),
      attendees: Array.from(
        { length: getRandomInt(1, 10, random) },
        () => getRandomInt(1, 50, random)
      ),
      status: getRandomItem(['scheduled', 'cancelled', 'completed', 'postponed'], random),
      type: getRandomItem(['meeting', 'call', 'deadline', 'reminder', 'event', 'conference'], random),
      isRecurring: random() > 0.7,
      recurrencePattern: random() > 0.7 ? getRandomItem(['daily', 'weekly', 'monthly', 'yearly'], random) : null
    });
  }
  
  return events;
}

/**
 * Generate task mock data
 */
function generateTaskData(count: number, random = Math.random): any[] {
  const tasks = [];
  
  for (let i = 0; i < count; i++) {
    tasks.push({
      id: i + 1,
      title: getRandomItem([
        'Complete project proposal',
        'Schedule team meeting',
        'Review code changes',
        'Update documentation',
        'Prepare presentation slides',
        'Fix reported bugs',
        'Research new technologies',
        'Create wireframes',
        'Contact client for feedback',
        'Update website content'
      ], random),
      description: random() > 0.3 ? loremIpsum.slice(0, getRandomInt(50, 200, random)) : null,
      status: getRandomItem(['backlog', 'todo', 'in_progress', 'review', 'done'], random),
      priority: getRandomItem(['low', 'medium', 'high', 'urgent'], random),
      assigneeId: getRandomInt(1, 20, random),
      creatorId: getRandomInt(1, 20, random),
      projectId: getRandomInt(1, 10, random),
      dueDate: random() > 0.2 ? new Date(Date.now() + getRandomInt(-10, 30, random) * 24 * 60 * 60 * 1000).toISOString() : null,
      createdAt: new Date(Date.now() - getRandomInt(1, 60, random) * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: random() > 0.7 ? new Date(Date.now() - getRandomInt(1, 10, random) * 24 * 60 * 60 * 1000).toISOString() : null,
      tags: Array.from(
        { length: getRandomInt(0, 3, random) },
        () => getRandomItem(['bug', 'feature', 'documentation', 'design', 'backend', 'frontend'], random)
      ),
      estimatedHours: getRandomInt(1, 40, random)
    });
  }
  
  return tasks;
}

/**
 * Generate contact mock data
 */
function generateContactData(count: number, random = Math.random): any[] {
  const contacts = [];
  const firstNames = [
    'James', 'John', 'Robert', 'Michael', 'William',
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth'
  ];
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
    'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'
  ];
  const companies = [
    'Acme Corp', 'Globex', 'Initech', 'Stark Industries', 'Wayne Enterprises',
    'Cyberdyne Systems', 'Umbrella Corporation', 'Soylent Corp', 'Massive Dynamic'
  ];
  
  for (let i = 0; i < count; i++) {
    const firstName = getRandomItem(firstNames, random);
    const lastName = getRandomItem(lastNames, random);
    
    contacts.push({
      id: i + 1,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomItem(['gmail.com', 'yahoo.com', 'outlook.com', 'example.com'], random)}`,
      phone: `${getRandomInt(100, 999, random)}-${getRandomInt(100, 999, random)}-${getRandomInt(1000, 9999, random)}`,
      company: random() > 0.3 ? getRandomItem(companies, random) : null,
      jobTitle: random() > 0.3 ? getRandomItem([
        'CEO', 'CTO', 'Manager', 'Developer', 'Designer',
        'Sales Representative', 'Marketing Specialist', 'Project Manager', 'Analyst', 'Consultant'
      ], random) : null,
      address: random() > 0.5 ? {
        street: `${getRandomInt(100, 999, random)} ${getRandomItem(['Main', 'Oak', 'Pine', 'Maple'], random)} ${getRandomItem(['St', 'Ave', 'Blvd', 'Rd'], random)}`,
        city: getRandomItem(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'], random),
        state: getRandomItem(['CA', 'TX', 'NY', 'FL', 'IL'], random),
        zipCode: getRandomInt(10000, 99999, random).toString(),
      } : null,
      notes: random() > 0.7 ? loremIpsum.slice(0, getRandomInt(50, 200, random)) : null,
      tags: Array.from(
        { length: getRandomInt(0, 3, random) },
        () => getRandomItem(['client', 'lead', 'vendor', 'partner', 'personal'], random)
      ),
      createdAt: new Date(Date.now() - getRandomInt(1, 365, random) * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return contacts;
}

/**
 * Generate custom data based on schema
 */
function generateCustomData(schema: any, count: number, random = Math.random): any[] {
  const result = [];
  
  for (let i = 0; i < count; i++) {
    const item: Record<string, any> = {};
    
    // Process each field in the schema
    for (const [key, def] of Object.entries(schema)) {
      if (typeof def === 'string') {
        // Simple type definition
        item[key] = generateValueForType(def, random);
      } else if (typeof def === 'object' && def !== null) {
        // Complex field definition
        if ('type' in def && typeof def.type === 'string' && def.type === 'enum' && 'values' in def && Array.isArray(def.values)) {
          item[key] = getRandomItem(def.values, random);
        } else if ('type' in def && typeof def.type === 'string' && def.type === 'range' && 'min' in def && typeof def.min === 'number' && 'max' in def && typeof def.max === 'number') {
          item[key] = getRandomInt(def.min, def.max, random);
        } else if ('type' in def && typeof def.type === 'string' && def.type === 'array' && 'of' in def && def.of) {
          const length = ('length' in def && typeof def.length === 'number' ? def.length : getRandomInt(0, 5, random));
          item[key] = Array.from(
            { length: length },
            () => ('of' in def && typeof def.of === 'string') ? generateValueForType(def.of, random) : getRandomItem((def as any).of, random)
          );
        } else if ('type' in def && typeof def.type === 'string' && def.type === 'object' && 'properties' in def && def.properties) {
          item[key] = generateCustomData(def.properties, 1, random)[0];
        } else {
          // Fallback for unknown types
          item[key] = null;
        }
      }
    }
    
    // Add an ID field if not present
    if (!('id' in item)) {
      item.id = i + 1;
    }
    
    result.push(item);
  }
  
  return result;
}

/**
 * Generate a value for a simple type
 */
function generateValueForType(type: string, random = Math.random): any {
  switch (type) {
    case 'string':
      return loremIpsum.slice(0, getRandomInt(10, 50, random));
    case 'number':
      return getRandomInt(1, 1000, random);
    case 'boolean':
      return random() > 0.5;
    case 'date':
      return new Date(Date.now() - getRandomInt(1, 365, random) * 24 * 60 * 60 * 1000).toISOString();
    case 'email':
      const username = loremIpsum.slice(0, 8).replace(/\s+/g, '').toLowerCase();
      return `${username}${getRandomInt(1, 100, random)}@example.com`;
    case 'phone':
      return `${getRandomInt(100, 999, random)}-${getRandomInt(100, 999, random)}-${getRandomInt(1000, 9999, random)}`;
    case 'url':
      return `https://example.com/${loremIpsum.slice(0, 10).replace(/\s+/g, '-').toLowerCase()}`;
    case 'id':
      return crypto.randomBytes(8).toString('hex');
    default:
      return null;
  }
}
