"use client"
// Make this a client-only page so it can react to the auth token immediately
// and fetch services without waiting for a full page reload or SSR token.
import React from "react"
import ServicesClient from "./serviceCkient"

export default function ServicesPage(): React.ReactElement {
  // We intentionally skip SSR here because the API usually requires an auth token
  // stored in localStorage. The ServicesClient will fetch as soon as the token
  // is available from AuthContext, eliminating the need to reload after login.
  return <ServicesClient initialServices={[]} />
}
