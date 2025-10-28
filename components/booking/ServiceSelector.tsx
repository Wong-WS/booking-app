'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Service } from '@/types'

type ServiceSelectorProps = {
  services: Service[]
  onSelect: (service: Service) => void
}

export default function ServiceSelector({ services, onSelect }: ServiceSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select a Service</CardTitle>
        <CardDescription>Choose the service you'd like to book</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{service.name}</h3>
                {service.description && (
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                )}
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  <span>⏱️ {service.duration} min</span>
                  <span>💰 ${service.price.toFixed(2)}</span>
                </div>
              </div>
              <Button onClick={() => onSelect(service)}>Select</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
