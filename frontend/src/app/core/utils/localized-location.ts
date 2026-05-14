import { Location } from '../models/app.models';
import { AppLanguage } from '../services/language.service';

export function locationTitle(location: Location, language: AppLanguage): string {
  return language === 'sq' ? location.titleSq || location.title : location.title;
}

export function locationDescription(location: Location, language: AppLanguage): string {
  return language === 'sq' ? location.descriptionSq || location.description : location.description;
}

export function locationCity(location: Location, language: AppLanguage): string {
  return language === 'sq' ? location.citySq || location.city : location.city;
}

export function locationAddress(location: Location, language: AppLanguage): string {
  return language === 'sq' ? location.addressSq || location.address : location.address;
}
