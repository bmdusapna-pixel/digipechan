"use client";

import { aboutData } from "@/data/about-data";
import { Card, CardContent } from "@/components/ui/card";

export function MissionSection() {
    const { whyChooseUs } = aboutData;

    return (
        <section className="bg-muted/60 w-full py-12 md:py-16 lg:py-20">
            <div className="px-4 md:px-40">
                <div className="space-y-4 text-center">
                    <h2 className="text-2xl font-bold tracking-tight sm:text-4xl md:text-5xl">{whyChooseUs.title}</h2>
                    <p className="text-muted-foreground mx-auto max-w-2xl text-sm sm:text-lg">{whyChooseUs.intro}</p>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {whyChooseUs.points.map((point) => (
                        <Card key={point.title} className="h-full">
                            <CardContent className="flex flex-col items-start space-y-4">
                                <div className="text-primary flex items-center gap-3">
                                    <point.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                                    <h3 className="text-lg font-semibold">{point.title}</h3>
                                </div>
                                <p className="text-muted-foreground text-sm">{point.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
