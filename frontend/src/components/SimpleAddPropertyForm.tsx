import { useState } from "react";
import { useCreateProperty, CreatePropertyData } from "@/hooks/useProperties";

interface SimpleAddPropertyFormProps {
    onClose: () => void;
}

const SimpleAddPropertyForm = ({ onClose }: SimpleAddPropertyFormProps) => {
    const createProperty = useCreateProperty();
    const [formData, setFormData] = useState<CreatePropertyData>({
        name: "",
        property_type: "",
        address: "",
        city: "",
        country: "",
        postcode: "",
        phone: "",
        mobile: "",
        email: "",
        contact_first_name: "",
        contact_last_name: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (!formData.name.trim() || !formData.property_type) {
                alert("Bitte füllen Sie Name und Typ aus.");
                return;
            }

            console.log("Submitting property:", formData);
            await createProperty.mutateAsync(formData);
            onClose();
        } catch (error) {
            console.error("Error creating property:", error);
            alert("Fehler beim Erstellen der Unterkunft");
        }
    };

    const handleInputChange = (field: keyof CreatePropertyData, value: string) => {
        try {
            setFormData(prev => ({ ...prev, [field]: value }));
        } catch (error) {
            console.error("Error updating form field:", error);
        }
    };

    const isFormValid = formData.name.trim().length > 0 && formData.property_type.length > 0;

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Neue Unterkunft hinzufügen</h2>
                <button 
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                    ×
                </button>
            </div>
            
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Name der Unterkunft *
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="z.B. Ferienwohnung Sonnenschein"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-1">
                                Typ *
                            </label>
                            <select
                                id="property_type"
                                value={formData.property_type}
                                onChange={(e) => handleInputChange("property_type", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Typ auswählen</option>
                                <option value="apartment">Ferienwohnung</option>
                                <option value="house">Ferienhaus</option>
                                <option value="room">Zimmer</option>
                                <option value="hotel">Hotel</option>
                                <option value="bungalow">Bungalow</option>
                                <option value="other">Sonstiges</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                Stadt
                            </label>
                            <input
                                id="city"
                                type="text"
                                value={formData.city}
                                onChange={(e) => handleInputChange("city", e.target.value)}
                                placeholder="z.B. München"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                Adresse
                            </label>
                            <input
                                id="address"
                                type="text"
                                value={formData.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                placeholder="z.B. Musterstraße 123"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
                                Postleitzahl
                            </label>
                            <input
                                id="postcode"
                                type="text"
                                value={formData.postcode}
                                onChange={(e) => handleInputChange("postcode", e.target.value)}
                                placeholder="z.B. 80331"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                Land
                            </label>
                            <input
                                id="country"
                                type="text"
                                value={formData.country}
                                onChange={(e) => handleInputChange("country", e.target.value)}
                                placeholder="z.B. Deutschland"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Telefon
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                placeholder="z.B. +49 89 123456"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                                Mobil
                            </label>
                            <input
                                id="mobile"
                                type="tel"
                                value={formData.mobile}
                                onChange={(e) => handleInputChange("mobile", e.target.value)}
                                placeholder="z.B. +49 171 1234567"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                E-Mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                placeholder="z.B. info@unterkunft.de"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="contact_first_name" className="block text-sm font-medium text-gray-700 mb-1">
                                Vorname Ansprechpartner
                            </label>
                            <input
                                id="contact_first_name"
                                type="text"
                                value={formData.contact_first_name}
                                onChange={(e) => handleInputChange("contact_first_name", e.target.value)}
                                placeholder="z.B. Max"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="contact_last_name" className="block text-sm font-medium text-gray-700 mb-1">
                                Nachname Ansprechpartner
                            </label>
                            <input
                                id="contact_last_name"
                                type="text"
                                value={formData.contact_last_name}
                                onChange={(e) => handleInputChange("contact_last_name", e.target.value)}
                                placeholder="z.B. Mustermann"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button 
                            type="submit" 
                            disabled={createProperty.isPending || !isFormValid}
                            className={`px-4 py-2 rounded-md font-medium ${
                                isFormValid && !createProperty.isPending
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            {createProperty.isPending ? "Wird erstellt..." : "Unterkunft erstellen"}
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Abbrechen
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SimpleAddPropertyForm;