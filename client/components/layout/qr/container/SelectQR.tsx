import { QRSelectionCards } from "../presentational/QRSelectionCards";

export default function SelectQR() {
    return (
        <div className="from-muted/30 to-background text-foreground z-20 flex h-screen flex-col items-center justify-center bg-gradient-to-br px-8 md:px-0">
            <div className="from-primary to-accent mb-6 bg-gradient-to-r bg-clip-text text-center text-2xl font-bold text-transparent md:text-4xl">
                Select QR Type
            </div>
            <div className="text-muted-foreground mx-auto mb-8 max-w-2xl text-center text-xl">
                Choose the type of QR code you want to generate
            </div>
            <QRSelectionCards />
        </div>
    );
}
