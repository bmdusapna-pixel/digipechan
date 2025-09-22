"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { aboutData } from "@/data/about-data";
import { CheckCircle2, Download } from "lucide-react";
import { generateResellerPDF } from "@/common/helpers/download/generateResellerPDF";

export function ResellerTermsSection() {
    const { resellerTerms } = aboutData;

    return (
        <section className="bg-muted/40 w-full py-12 md:py-16 lg:py-20">
            <div className="px-4 md:px-40">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold tracking-tight sm:text-4xl">
                            {resellerTerms.title}
                        </CardTitle>
                        <CardDescription className="mx-auto mt-2 max-w-2xl">
                            {resellerTerms.introduction}{" "}
                            <a href={resellerTerms.website} target="_blank" className="text-accent underline">
                                {resellerTerms.website}
                            </a>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <ul className="space-y-4">
                            {resellerTerms.terms.map((term, index) => (
                                <li key={index} className="flex items-start gap-4">
                                    <CheckCircle2 className="text-primary mt-1 h-6 w-6 flex-shrink-0" />
                                    <p className="text-muted-foreground">{term}</p>
                                </li>
                            ))}
                        </ul>
                        <div className="space-y-4 border-t pt-6">
                            <p className="text-muted-foreground text-sm font-medium">{resellerTerms.commitment}</p>
                            <p className="text-muted-foreground text-sm">{resellerTerms.closing}</p>
                            <div className="text-right">
                                <p className="font-semibold">{resellerTerms.founder}</p>
                                <p className="text-muted-foreground text-sm">{resellerTerms.founderTitle}</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button onClick={() => generateResellerPDF()}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Reseller Terms as PDF
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </section>
    );
}
