"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aboutData } from "@/data/about-data";

export function FeaturesSection() {
    return (
        <section className="w-full py-12 md:py-16 lg:py-20">
            <div className="px-4 md:px-40">
                <div className="mb-12 flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="bg-accent/20 inline-block rounded-lg px-3 py-1 text-sm">Our Features</div>
                        <h2 className="text-2xl font-bold tracking-tighter sm:text-5xl">Secure, Smart, and Simple</h2>
                        <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Everything you need for peace of mind, built with privacy as a priority.
                        </p>
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {aboutData.features.map((feature) => (
                        <Card key={feature.title}>
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                <feature.icon className="text-primary h-8 w-8" />
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
