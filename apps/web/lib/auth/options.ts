import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getAthleteByEmail } from "@/lib/sheets/repositories";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Athlete Login",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Access code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) {
          return null;
        }
        const athlete = await getAthleteByEmail(credentials.email);
        if (!athlete) {
          return null;
        }
        // Simple demo: use last name as access code for seed users.
        if (credentials.code.toLowerCase() !== athlete.lastName.toLowerCase()) {
          return null;
        }
        return {
          id: athlete.id,
          email: athlete.email,
          name: `${athlete.firstName} ${athlete.lastName}`,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.athleteId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.athleteId) {
        session.user.id = token.athleteId as string;
      }
      return session;
    },
  },
};
