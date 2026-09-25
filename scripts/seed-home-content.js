/**
 * Seeds current homepage Client Logos, Affiliations, and Testimonials into MongoDB
 * so they can be managed (create/edit/delete) from admin Content Management.
 */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const CLIENT_LOGOS = Array.from({ length: 36 }, (_, i) => ({
  name: `Client ${i + 1}`,
  logoUrl: `/clients/${i + 1}.jpg`,
  sortOrder: i + 1,
  status: 'Active',
}))

const AFFILIATIONS = [
  { name: 'Accreditation Partner 1', imageUrl: '/Affiliations/1.png', url: '#', sortOrder: 1 },
  { name: 'Accreditation Partner 2', imageUrl: '/Affiliations/2.png', url: '#', sortOrder: 2 },
  { name: 'Accreditation Partner 3', imageUrl: '/Affiliations/3.png', url: '#', sortOrder: 3 },
  { name: 'Accreditation Partner 4', imageUrl: '/Affiliations/4.png', url: '/courses/certificate/696e0459612d640dea16b6ba', sortOrder: 4 },
  { name: 'Accreditation Partner 5', imageUrl: '/Affiliations/5.png', url: '#', sortOrder: 5 },
  { name: 'Accreditation Partner 6', imageUrl: '/Affiliations/1.jpg', url: '#', sortOrder: 6 },
  { name: 'Accreditation Partner 7', imageUrl: '/Affiliations/2.jpg', url: '#', sortOrder: 7 },
  { name: 'Accreditation Partner 8', imageUrl: '/Affiliations/3.jpg', url: '#', sortOrder: 8 },
  { name: 'Accreditation Partner 9', imageUrl: '/Affiliations/4.jpg', url: '#', sortOrder: 9 },
  { name: 'Accreditation Partner 10', imageUrl: '/Affiliations/5.jpg', url: '#', sortOrder: 10 },
  { name: 'Accreditation Partner 11', imageUrl: '/Affiliations/6.jpg', url: '#', sortOrder: 11 },
  { name: 'Accreditation Partner 12', imageUrl: '/Affiliations/7.jpg', url: '#', sortOrder: 12 },
  { name: 'Accreditation Partner 13', imageUrl: '/Affiliations/8.jpg', url: '#', sortOrder: 13 },
  { name: 'Accreditation Partner 14', imageUrl: '/Affiliations/9.jpg', url: '#', sortOrder: 14 },
  { name: 'Accreditation Partner 15', imageUrl: '/Affiliations/10.jpg', url: '/courses/certificate/696e060364e06418a46a3a4f', sortOrder: 15 },
  { name: 'Accreditation Partner 16', imageUrl: '/Affiliations/11.jpg', url: '#', sortOrder: 16 },
  { name: 'Accreditation Partner 17', imageUrl: '/Affiliations/12.jpg', url: '/courses/certificate/696e06f264e06418a46a3a50', sortOrder: 17 },
  { name: 'Accreditation Partner 18', imageUrl: '/Affiliations/13.jpg', url: '#', sortOrder: 18 },
].map((a) => ({ ...a, status: 'Active' }))

const TESTIMONIALS = [
  {
    name: 'Umar Bakoji',
    position: 'Manager Services',
    company: 'Qatar Financial Authority',
    course: 'Project Management Masterclass',
    review:
      'One of the most beneficial course attended this year. Instructors capabilities to keep attention is excellent and he presented subjects clearly with great examples.',
    rating: 5,
    avatarUrl: '/placeholder.svg?height=60&width=60',
    verified: true,
    sortOrder: 1,
    status: 'Active',
  },
  {
    name: 'Maryrose R O',
    position: 'General Manager',
    company: null,
    course: 'Putting Strategy into Action',
    review:
      'This program was excellent. Very practical, nice facilities and a great instructor who understood our business',
    rating: 5,
    avatarUrl: '/placeholder.svg?height=60&width=60',
    verified: true,
    sortOrder: 2,
    status: 'Active',
  },
  {
    name: 'Dr. James D. Wilson.',
    position: 'BDS',
    company: null,
    course: 'Leadership for 4IR: the 4.0D Leadership Model',
    review:
      'I have attended more than 30 training programs in my career and this was by far the best Leadership training event EVER! Johann and John are a compelling double act.',
    rating: 5,
    avatarUrl: '/placeholder.svg?height=60&width=60',
    verified: true,
    sortOrder: 3,
    status: 'Active',
  },
  {
    name: 'Yakubu A',
    position: 'General Manager',
    company: null,
    course: 'Due Diligence in the Petroleum Business',
    review:
      'The instructor made the complexities of corporate governance seem easy. Thoroughly recommend this program.',
    rating: 5,
    avatarUrl: '/placeholder.svg?height=60&width=60',
    verified: true,
    sortOrder: 4,
    status: 'Active',
  },
  {
    name: 'Rachel N',
    position: 'Office Procurement',
    company: null,
    course: 'Key Managerial Skills for New Managers & Supervisors',
    review:
      'A good mix of theory and practice I feel much more confident now in my new role as Shift Supervisor.',
    rating: 5,
    avatarUrl: '/placeholder.svg?height=60&width=60',
    verified: true,
    sortOrder: 5,
    status: 'Active',
  },
  {
    name: 'Imi Umaru',
    position: 'Manager Procurement',
    company: null,
    course: 'Procurement & Supply Chain Management',
    review: 'This was an intensive program over 10 days, but the time flew by, thank you.',
    rating: 5,
    avatarUrl: '/placeholder.svg?height=60&width=60',
    verified: true,
    sortOrder: 6,
    status: 'Active',
  },
  {
    name: 'Abdullah Al Thani',
    position: 'Senior Financial Analyst',
    company: null,
    course: 'Financial Statement Analysis of the Public Sector',
    review: 'Excellent course 5* Great instructors who knew their subject matter well.',
    rating: 5,
    avatarUrl: '/placeholder.svg?height=60&width=60',
    verified: true,
    sortOrder: 7,
    status: 'Active',
  },
  {
    name: 'Moza Al Ali',
    position: 'PA - Group Chairman',
    company: null,
    course: "Developing Professional Skills for Executive Secretaries & PA's",
    review: 'The trainer was excellent, she helped everyone and provided excellent examples',
    rating: 5,
    avatarUrl: '/placeholder.svg?height=60&width=60',
    verified: true,
    sortOrder: 8,
    status: 'Active',
  },
  {
    name: 'Mohammed Al Abdallah',
    position: 'Maintenance Engineer',
    company: null,
    course: 'Pumps & Compressors: Operation, Maintenance & Troubleshooting',
    review: 'High level training delivered by High level instructors',
    rating: 5,
    avatarUrl: '/placeholder.svg?height=60&width=60',
    verified: true,
    sortOrder: 9,
    status: 'Active',
  },
]

async function seedCollection(label, countFn, createManyFn, data) {
  const existing = await countFn()
  if (existing > 0) {
    console.log(`⏭️  ${label}: already has ${existing} item(s) — skipped`)
    return { seeded: 0, existing }
  }
  await createManyFn(data)
  console.log(`✅ ${label}: seeded ${data.length} item(s)`)
  return { seeded: data.length, existing: 0 }
}

async function main() {
  console.log('Seeding homepage content…')

  await seedCollection(
    'Client logos',
    () => prisma.clientLogo.count(),
    (data) => prisma.clientLogo.createMany({ data }),
    CLIENT_LOGOS
  )

  await seedCollection(
    'Affiliations',
    () => prisma.affiliation.count(),
    (data) => prisma.affiliation.createMany({ data }),
    AFFILIATIONS
  )

  await seedCollection(
    'Testimonials',
    () => prisma.testimonial.count(),
    (data) => prisma.testimonial.createMany({ data }),
    TESTIMONIALS
  )

  const [logos, affs, tests] = await Promise.all([
    prisma.clientLogo.count(),
    prisma.affiliation.count(),
    prisma.testimonial.count(),
  ])
  console.log(`\nDone. Totals — logos: ${logos}, affiliations: ${affs}, testimonials: ${tests}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
