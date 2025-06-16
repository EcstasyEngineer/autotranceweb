<<<<<<< HEAD
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
=======
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
>>>>>>> cd77a9e63db42ba8cea66b70f42f7403c61f53a4
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
<<<<<<< HEAD
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
=======
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        // For now, we'll use simple password comparison
        // In production, implement proper password hashing
        const isPasswordValid = credentials.password === "password"

        if (!isPasswordValid) {
          return null
>>>>>>> cd77a9e63db42ba8cea66b70f42f7403c61f53a4
        }

        return {
          id: user.id,
          email: user.email,
<<<<<<< HEAD
          name: user.name || undefined,
          role: user.role,
        };
=======
          name: user.name,
        }
>>>>>>> cd77a9e63db42ba8cea66b70f42f7403c61f53a4
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
<<<<<<< HEAD
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login"
  }
};
=======
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}
>>>>>>> cd77a9e63db42ba8cea66b70f42f7403c61f53a4
