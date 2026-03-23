import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateProperty, CreatePropertyData } from "@/hooks/useProperties";
import { Building2, X } from "lucide-react";

interface AddPropertyFormProps {
    onClose: () => void;
}

// Error boundary wrapper for the form
const FormErrorBoundary = ({ children }: { children: React.ReactNode }) => {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="p-6">
                    <div className="text-center space-y-4">
                        <div className="text-red-500 font-semibold">
                            Fehler beim Laden des Formulars
                        </div>
                        <Button onClick={() => setHasError(false)}>
                            Erneut versuchen
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    try {
        return <>{children}</>;
    } catch (error) {
        console.error("Form error:", error);
        setHasError(true);
        return null;
    }
};

const AddPropertyForm = ({ onClose }: AddPropertyFormProps) => {
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
                console.log("Validation failed:", { name: formData.name.trim(), type: formData.property_type });
                return;
            }

            console.log("Submitting property:", formData);
            await createProperty.mutateAsync(formData);
            onClose();
        } catch (error) {
            console.error("Error creating property:", error);
        }
    };

    const handleInputChange = (field: keyof CreatePropertyData, value: string) => {
        try {
            console.log(`Updating ${field}:`, value);
            setFormData(prev => ({ ...prev, [field]: value }));
        } catch (error) {
            console.error("Error updating form field:", error);
        }
    };

    const handleTypeChange = (value: string) => {
        try {
            console.log("Type selected:", value);
            setFormData(prev => ({ ...prev, property_type: value }));
        } catch (error) {
            console.error("Error updating property type:", error);
        }
    };

    // Debug: Log current form state
    console.log("Current form data:", formData);
    console.log("Button should be enabled:", formData.name.trim() && formData.property_type);

    const isFormValid = formData.name.trim().length > 0 && formData.property_type.length > 0;

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Neue Unterkunft hinzufügen
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Label htmlFor="name">Name der Unterkunft *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="z.B. Ferienwohnung Sonnenschein"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="property_type">Typ *</Label>
                            <select
                                id="property_type"
                                value={formData.property_type}
                                onChange={(e) => handleTypeChange(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                            <Label htmlFor="city">Stadt</Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => handleInputChange("city", e.target.value)}
                                placeholder="z.B. München"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="address">Adresse</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                placeholder="z.B. Musterstraße 123"
                            />
                        </div>

                        <div>
                            <Label htmlFor="postcode">Postleitzahl</Label>
                            <Input
                                id="postcode"
                                value={formData.postcode}
                                onChange={(e) => handleInputChange("postcode", e.target.value)}
                                placeholder="z.B. 80331"
                            />
                        </div>

                        <div>
                            <Label htmlFor="country">Land</Label>
                            <Input
                                id="country"
                                value={formData.country}
                                onChange={(e) => handleInputChange("country", e.target.value)}
                                placeholder="z.B. Deutschland"
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone">Telefon</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                placeholder="z.B. +49 89 123456"
                            />
                        </div>

                        <div>
                            <Label htmlFor="mobile">Mobil</Label>
                            <Input
                                id="mobile"
                                value={formData.mobile}
                                onChange={(e) => handleInputChange("mobile", e.target.value)}
                                placeholder="z.B. +49 171 1234567"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">E-Mail</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                placeholder="z.B. info@unterkunft.de"
                            />
                        </div>

                        <div>
                            <Label htmlFor="contact_first_name">Vorname Ansprechpartner</Label>
                            <Input
                                id="contact_first_name"
                                value={formData.contact_first_name}
                                onChange={(e) => handleInputChange("contact_first_name", e.target.value)}
                                placeholder="z.B. Max"
                            />
                        </div>

                        <div>
                            <Label htmlFor="contact_last_name">Nachname Ansprechpartner</Label>
                            <Input
                                id="contact_last_name"
                                value={formData.contact_last_name}
                                onChange={(e) => handleInputChange("contact_last_name", e.target.value)}
                                placeholder="z.B. Mustermann"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button 
                            type="submit" 
                            disabled={createProperty.isPending || !isFormValid}
                            className={isFormValid ? "" : "opacity-50 cursor-not-allowed"}
                        >
                            {createProperty.isPending ? "Wird erstellt..." : "Unterkunft erstellen"}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Abbrechen
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ({ onClose }: AddPropertyFormProps) => (
    <FormErrorBoundary>
        <AddPropertyForm onClose={onClose} />
    </FormErrorBoundary>
);