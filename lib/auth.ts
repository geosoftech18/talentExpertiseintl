import { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Validate environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️ Google OAuth credentials are missing. Google login will not work.")
}

if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
  console.warn("⚠️ LinkedIn OAuth credentials are missing. LinkedIn login will not work.")
}

if (!process.env.NEXTAUTH_SECRET) {
  console.error("❌ NEXTAUTH_SECRET is missing. Authentication will not work!")
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error("Invalid email or password")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/api/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign in - create or update user in database
      if (account && (account.provider === "google" || account.provider === "linkedin")) {
        try {
          // Check if user exists
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!dbUser) {
            // Create new user
            dbUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || null,
                image: user.image || null,
                emailVerified: new Date(),
              },
            })
          } else {
            // Update existing user
            dbUser = await prisma.user.update({
              where: { email: user.email! },
              data: {
                name: user.name || dbUser.name,
                image: user.image || dbUser.image,
              },
            })
          }

          // Create or update account
          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            update: {
              access_token: account.access_token || null,
              refresh_token: account.refresh_token || null,
              expires_at: account.expires_at || null,
              token_type: account.token_type || null,
              scope: account.scope || null,
              id_token: account.id_token || null,
              session_state: account.session_state || null,
            },
            create: {
              userId: dbUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token || null,
              refresh_token: account.refresh_token || null,
              expires_at: account.expires_at || null,
              token_type: account.token_type || null,
              scope: account.scope || null,
              id_token: account.id_token || null,
              session_state: account.session_state || null,
            },
          })
        } catch (error) {
          console.error("Error in signIn callback:", error)
          // Return true to allow sign in even if DB update fails
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      try {
        if (user) {
          // If user has id, use it
          if (user.id) {
            token.id = user.id
          } else if (user.email) {
            // For OAuth users, fetch ID from database
            try {
              const dbUser = await prisma.user.findUnique({
                where: { email: user.email },
                select: { id: true },
              })
              if (dbUser) {
                token.id = dbUser.id
              }
            } catch (error) {
              console.error("Error fetching user in JWT callback:", error)
            }
          }
        }
        if (account) {
          token.accessToken = account.access_token
        }
      } catch (error) {
        console.error("Error in JWT callback:", error)
      }
      return token
    },
    async session({ session, token }) {
      try {
        // Always return a valid session object
        if (!session) {
          console.warn("⚠️ Session is null in session callback")
          return {
            user: null,
            expires: null,
          }
        }
        
        // Ensure user object exists
        if (!session.user) {
          session.user = {
            id: null,
            email: null,
            name: null,
            image: null,
          } as any
        }
        
        // Safely add user ID to session
        if (token?.id) {
          session.user.id = token.id as string
        }
        
        // Ensure expires is set
        if (!session.expires) {
          session.expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
        
        return session
      } catch (error) {
        console.error("❌ Error in session callback:", error)
        // Return a safe default session that NextAuth can handle
        return {
          user: null,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only",
  debug: process.env.NODE_ENV === "development",
  trustHost: true, // Required for NextAuth v5
  useSecureCookies: process.env.NODE_ENV === "production",
}

// Export auth function for use in API routes
export const { auth } = NextAuth(authOptions)

