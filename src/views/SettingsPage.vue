<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/"></ion-back-button>
                </ion-buttons>
                <ion-title>Settings</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item>
                    <ion-label>Coordinate System</ion-label>
                    <ion-select slot="end" v-model="settingStore.epsg">
                        <ion-select-option value="EPSG:25832">ETRS89 UTM32</ion-select-option>
                        <ion-select-option value="EPSG:25833">ETRS89 UTM33</ion-select-option>
                        <ion-select-option value="EPSG:31467">Bessel GK3</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-label>Geolocation</ion-label>
                    <ion-toggle slot="end" v-model="settingStore.geolocation"></ion-toggle>
                </ion-item>
                <ion-item>
                    <ion-label>Backup</ion-label>
                    <ion-button slot="end">Backup</ion-button>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonList, IonItem, IonLabel, IonSelect, IonSelectOption, IonToggle, IonButton } from '@ionic/vue';
import { useSettingStore } from '@/store';


const settingStore = useSettingStore();


</script>