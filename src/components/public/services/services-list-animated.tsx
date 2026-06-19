"use client"

import { motion } from "framer-motion"
import { staggerContainer } from "@/lib/animations"
import { ServiceListCard } from "./service-list-card"
import { SERVICES, type Service } from "@/components/public/sections/services-data"

// Import SERVICES directly — passing it as a prop from a Server Component
// would attempt to serialize the lucide icon function reference, which RSC forbids.
interface ServicesListAnimatedProps {
  services?: Service[]
}

export function ServicesListAnimated({ services = SERVICES }: ServicesListAnimatedProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="border-t border-[var(--border)]"
    >
      {services.map((service, i) => (
        <ServiceListCard key={service.slug} service={service} index={i} />
      ))}
    </motion.div>
  )
}
