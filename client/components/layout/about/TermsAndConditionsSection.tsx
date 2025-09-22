"use client";
"use client";
import { generateTermsPDF } from "@/common/helpers/download/generateTermsPDF";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { aboutData } from "@/data/about-data";
import { Download } from "lucide-react";

export function TermsAndConditionsSection() {
    const { termsAndConditions } = aboutData;


    return (
        <section className="w-full py-12 md:py-16 lg:py-20">
            <div className="container mx-auto max-w-4xl px-4 md:px-6">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{termsAndConditions.title}</h2>
                    <p className="text-muted-foreground mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {termsAndConditions.sections.map((section, index) => (
                        <AccordionItem value={`item-${index}`} key={section.title}>
                            <AccordionTrigger className="text-left text-lg font-semibold">
                                {section.title}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground space-y-4">
                                {section.content.map((paragraph, pIndex) => (
                                    <p key={pIndex}>{paragraph}</p>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <div className="mt-12 text-center">
                    <Button onClick={() => generateTermsPDF()} size="lg">
                        <Download className="mr-2 h-4 w-4" />
                        Download Full Terms as PDF
                    </Button>
                </div>
            </div>
        </section>
    );
}
