import { CreateNewQRTypeForm } from "./CreateNewQRTypeForm";

export function CreateNewQRTypeContainer() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-6">
            <div className="mx-auto max-w-md">
                <CreateNewQRTypeForm />
            </div>
        </div>
    );
}