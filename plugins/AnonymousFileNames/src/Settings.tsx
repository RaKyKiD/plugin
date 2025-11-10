import { ReactNative as RN } from "@vendetta/metro/common";
import { Forms, SwitchItem } from "@vendetta/ui/components";
import { useProxy } from "@vendetta/storage";
import { storage } from "@vendetta/plugin";

const { FormInput, FormSwitchRow } = Forms; // FormSwitchRow para el toggle

export default () => {
    useProxy(storage);

    // Inicializa storage si no existe
    if (!storage.spoofedData) {
        storage.spoofedData = {
            email: "you234@gmail.com",
            phone: "+34655544544",
            verified: true
        };
    }

    const spoofedData = storage.spoofedData;

    return (
        <RN.ScrollView style={{ flex: 1 }}>
            <FormInput
                title="EMAIL"
                placeholder="ejemplo@email.com"
                value={spoofedData.email}
                onChange={(v: string) => {
                    storage.spoofedData = { ...spoofedData, email: v };
                }}
            />
            <FormInput
                title="PHONE"
                placeholder="+123456789"
                value={spoofedData.phone}
                onChange={(v: string) => {
                    storage.spoofedData = { ...spoofedData, phone: v };
                }}
            />
            <FormSwitchRow
                label="VERIFIED"
                enabled={spoofedData.verified}
                onValueChange={(value: boolean) => {
                    storage.spoofedData = { ...spoofedData, verified: value };
                }}
            />
        </RN.ScrollView>
    );
};
