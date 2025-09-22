"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTagTypeDisplayName = exports.getTagTypeFromString = exports.getQuestionsForTagType = exports.QR_TAG_QUESTIONS = exports.QRTagType = void 0;
var QRTagType;
(function (QRTagType) {
    QRTagType["CAR_TAG"] = "CAR_TAG";
    QRTagType["BIKE_TAG"] = "BIKE_TAG";
    QRTagType["PET_TAG"] = "PET_TAG";
    QRTagType["BAG_TAG"] = "BAG_TAG";
    QRTagType["TRAVEL_LUGGAGE_TAG"] = "TRAVEL_LUGGAGE_TAG";
    QRTagType["GADGET_TAG"] = "GADGET_TAG";
    QRTagType["DOCUMENT_TAG"] = "DOCUMENT_TAG";
    QRTagType["CHILD_TAG"] = "CHILD_TAG";
    QRTagType["ELDERLY_TAG"] = "ELDERLY_TAG";
    QRTagType["PROPERTY_TAG"] = "PROPERTY_TAG";
    QRTagType["BUSINESS_TAG"] = "BUSINESS_TAG";
    QRTagType["VEHICLE_TAG"] = "VEHICLE_TAG";
    QRTagType["EMERGENCY_TAG"] = "EMERGENCY_TAG";
    QRTagType["PERSONAL_ITEM_TAG"] = "PERSONAL_ITEM_TAG";
    QRTagType["MEDICAL_TAG"] = "MEDICAL_TAG";
    QRTagType["SECURITY_TAG"] = "SECURITY_TAG";
    QRTagType["DELIVERY_TAG"] = "DELIVERY_TAG";
    QRTagType["EVENT_TAG"] = "EVENT_TAG";
    QRTagType["CONTACT_TAG"] = "CONTACT_TAG";
})(QRTagType || (exports.QRTagType = QRTagType = {}));
exports.QR_TAG_QUESTIONS = {
    [QRTagType.CAR_TAG]: [
        { id: 'car_lights_on', text: 'The lights of this car are on', category: 'safety' },
        { id: 'car_no_parking', text: 'The car is in a no-parking zone', category: 'violation' },
        { id: 'car_towing', text: 'The car is getting towed', category: 'emergency' },
        { id: 'car_window_open', text: 'The car\'s window/door is open', category: 'security' },
        { id: 'car_something_wrong', text: 'Something seems wrong with the car (noise, leak, etc.)', category: 'mechanical' },
        { id: 'car_accident', text: 'The car has been in a minor accident', category: 'accident' },
        { id: 'car_blocking', text: 'Blocking the driveway/entry', category: 'inconvenience' },
    ],
    [QRTagType.BIKE_TAG]: [
        { id: 'bike_restricted_zone', text: 'Parked in a restricted zone', category: 'violation' },
        { id: 'bike_fallen', text: 'The bike has fallen down', category: 'damage' },
        { id: 'bike_key_ignition', text: 'Unattended bike with key in ignition', category: 'security' },
        { id: 'bike_suspicious', text: 'Suspicious behavior near the bike', category: 'security' },
        { id: 'bike_towing', text: 'Bike is being towed', category: 'emergency' },
        { id: 'bike_license_missing', text: 'License plate missing/broken', category: 'damage' },
    ],
    [QRTagType.PET_TAG]: [
        { id: 'pet_lost', text: 'The pet looks lost/alone', category: 'lost' },
        { id: 'pet_injured', text: 'Injured or unwell', category: 'medical' },
        { id: 'pet_scared', text: 'Seems scared or aggressive', category: 'behavior' },
        { id: 'pet_wandering', text: 'Wandering on the road', category: 'safety' },
        { id: 'pet_specific_area', text: 'Found near a specific area', category: 'location' },
        { id: 'pet_immediate_help', text: 'Needs immediate help', category: 'emergency' },
    ],
    [QRTagType.BAG_TAG]: [
        { id: 'bag_unattended', text: 'Found unattended at a location', category: 'lost' },
        { id: 'bag_travel_lost', text: 'Suspected lost during travel', category: 'travel' },
        { id: 'bag_id_inside', text: 'The bag has ID tag inside', category: 'identification' },
        { id: 'bag_left_vehicle', text: 'Bag was left in vehicle/public place', category: 'forgotten' },
        { id: 'bag_return_owner', text: 'Trying to return to rightful owner', category: 'return' },
    ],
    [QRTagType.TRAVEL_LUGGAGE_TAG]: [
        { id: 'luggage_left_airport', text: 'Left behind at airport/station', category: 'travel' },
        { id: 'luggage_damaged', text: 'Luggage damaged', category: 'damage' },
        { id: 'luggage_mistaken', text: 'Bag mistakenly taken', category: 'mistake' },
        { id: 'luggage_unattended', text: 'Found unattended', category: 'lost' },
        { id: 'luggage_pickup', text: 'Needs pickup at a certain location', category: 'pickup' },
    ],
    [QRTagType.GADGET_TAG]: [
        { id: 'gadget_public_area', text: 'Found phone/laptop in a public area', category: 'lost' },
        { id: 'gadget_left_cafe', text: 'Left at café, office, or transport', category: 'forgotten' },
        { id: 'gadget_screen_locked', text: 'Screen locked or damaged', category: 'technical' },
        { id: 'gadget_power', text: 'Device powered off/on', category: 'technical' },
        { id: 'gadget_belongs_someone', text: 'Belongs to someone around', category: 'identification' },
    ],
    [QRTagType.DOCUMENT_TAG]: [
        { id: 'doc_public_place', text: 'Found in public place', category: 'lost' },
        { id: 'doc_id_misplaced', text: 'ID/Wallet misplaced recently', category: 'lost' },
        { id: 'doc_passport_airport', text: 'Passport left at airport/travel spot', category: 'travel' },
        { id: 'doc_personal_details', text: 'Card/document contains personal details', category: 'security' },
    ],
    [QRTagType.CHILD_TAG]: [
        { id: 'child_lost', text: 'Child appears lost or alone', category: 'emergency' },
        { id: 'child_injured', text: 'Child seems injured or unwell', category: 'medical' },
        { id: 'child_scared', text: 'Child seems scared or distressed', category: 'safety' },
        { id: 'child_wandering', text: 'Child wandering alone in public', category: 'safety' },
        { id: 'child_unsafe', text: 'Child in unsafe situation', category: 'emergency' },
        { id: 'child_missing', text: 'Child reported missing', category: 'emergency' },
    ],
    [QRTagType.ELDERLY_TAG]: [
        { id: 'elderly_lost', text: 'Elderly person appears lost or confused', category: 'safety' },
        { id: 'elderly_injured', text: 'Elderly person seems injured or unwell', category: 'medical' },
        { id: 'elderly_fallen', text: 'Elderly person has fallen', category: 'medical' },
        { id: 'elderly_distressed', text: 'Elderly person seems distressed', category: 'safety' },
        { id: 'elderly_alone', text: 'Elderly person alone and needs help', category: 'assistance' },
        { id: 'elderly_emergency', text: 'Elderly person needs immediate help', category: 'emergency' },
    ],
    [QRTagType.PROPERTY_TAG]: [
        { id: 'property_damage', text: 'Property appears damaged', category: 'damage' },
        { id: 'property_vandalism', text: 'Signs of vandalism or break-in', category: 'security' },
        { id: 'property_abandoned', text: 'Property appears abandoned', category: 'concern' },
        { id: 'property_unsafe', text: 'Property looks unsafe or hazardous', category: 'safety' },
        { id: 'property_trespassing', text: 'Suspicious activity on property', category: 'security' },
        { id: 'property_emergency', text: 'Property emergency situation', category: 'emergency' },
    ],
    [QRTagType.BUSINESS_TAG]: [
        { id: 'business_closed', text: 'Business unexpectedly closed', category: 'information' },
        { id: 'business_emergency', text: 'Business emergency situation', category: 'emergency' },
        { id: 'business_damage', text: 'Business property damaged', category: 'damage' },
        { id: 'business_suspicious', text: 'Suspicious activity at business', category: 'security' },
        { id: 'business_help', text: 'Business needs assistance', category: 'assistance' },
        { id: 'business_contact', text: 'Need to contact business owner', category: 'contact' },
    ],
    [QRTagType.VEHICLE_TAG]: [
        { id: 'vehicle_abandoned', text: 'Vehicle appears abandoned', category: 'concern' },
        { id: 'vehicle_damaged', text: 'Vehicle is damaged', category: 'damage' },
        { id: 'vehicle_emergency', text: 'Vehicle emergency situation', category: 'emergency' },
        { id: 'vehicle_towed', text: 'Vehicle is being towed', category: 'emergency' },
        { id: 'vehicle_suspicious', text: 'Suspicious activity around vehicle', category: 'security' },
        { id: 'vehicle_help', text: 'Vehicle owner needs help', category: 'assistance' },
    ],
    [QRTagType.EMERGENCY_TAG]: [
        { id: 'emergency_medical', text: 'Medical emergency', category: 'emergency' },
        { id: 'emergency_fire', text: 'Fire emergency', category: 'emergency' },
        { id: 'emergency_accident', text: 'Accident occurred', category: 'emergency' },
        { id: 'emergency_crime', text: 'Crime in progress', category: 'emergency' },
        { id: 'emergency_natural', text: 'Natural disaster situation', category: 'emergency' },
        { id: 'emergency_other', text: 'Other emergency situation', category: 'emergency' },
    ],
    [QRTagType.PERSONAL_ITEM_TAG]: [
        { id: 'item_lost', text: 'Personal item found/lost', category: 'lost' },
        { id: 'item_damaged', text: 'Personal item is damaged', category: 'damage' },
        { id: 'item_stolen', text: 'Personal item appears stolen', category: 'security' },
        { id: 'item_return', text: 'Trying to return personal item', category: 'return' },
        { id: 'item_valuable', text: 'Valuable item found', category: 'security' },
        { id: 'item_identification', text: 'Item has identification', category: 'identification' },
    ],
    [QRTagType.MEDICAL_TAG]: [
        { id: 'medical_emergency', text: 'Medical emergency', category: 'emergency' },
        { id: 'medical_help', text: 'Person needs medical help', category: 'medical' },
        { id: 'medical_equipment', text: 'Medical equipment issue', category: 'medical' },
        { id: 'medical_medication', text: 'Medication-related concern', category: 'medical' },
        { id: 'medical_allergy', text: 'Allergic reaction', category: 'emergency' },
        { id: 'medical_condition', text: 'Medical condition concern', category: 'medical' },
    ],
    [QRTagType.SECURITY_TAG]: [
        { id: 'security_breach', text: 'Security breach detected', category: 'security' },
        { id: 'security_suspicious', text: 'Suspicious activity', category: 'security' },
        { id: 'security_unauthorized', text: 'Unauthorized access', category: 'security' },
        { id: 'security_alert', text: 'Security alert needed', category: 'security' },
        { id: 'security_help', text: 'Security assistance needed', category: 'security' },
        { id: 'security_emergency', text: 'Security emergency', category: 'emergency' },
    ],
    [QRTagType.DELIVERY_TAG]: [
        { id: 'delivery_missed', text: 'Delivery missed/undelivered', category: 'delivery' },
        { id: 'delivery_damaged', text: 'Delivery package damaged', category: 'damage' },
        { id: 'delivery_wrong', text: 'Wrong delivery address', category: 'delivery' },
        { id: 'delivery_urgent', text: 'Urgent delivery needed', category: 'delivery' },
        { id: 'delivery_contact', text: 'Need to contact delivery person', category: 'contact' },
        { id: 'delivery_issue', text: 'Delivery issue occurred', category: 'delivery' },
    ],
    [QRTagType.EVENT_TAG]: [
        { id: 'event_emergency', text: 'Event emergency situation', category: 'emergency' },
        { id: 'event_help', text: 'Event needs assistance', category: 'assistance' },
        { id: 'event_damage', text: 'Event property damaged', category: 'damage' },
        { id: 'event_safety', text: 'Event safety concern', category: 'safety' },
        { id: 'event_contact', text: 'Need to contact event organizer', category: 'contact' },
        { id: 'event_issue', text: 'Event-related issue', category: 'assistance' },
    ],
    [QRTagType.CONTACT_TAG]: [
        { id: 'contact_urgent', text: 'Urgent contact needed', category: 'contact' },
        { id: 'contact_emergency', text: 'Emergency contact required', category: 'emergency' },
        { id: 'contact_help', text: 'Need to contact for help', category: 'assistance' },
        { id: 'contact_information', text: 'Need to share information', category: 'information' },
        { id: 'contact_followup', text: 'Follow-up contact needed', category: 'contact' },
        { id: 'contact_other', text: 'Other contact reason', category: 'contact' },
    ],
};
const getQuestionsForTagType = (tagType) => {
    return exports.QR_TAG_QUESTIONS[tagType] || [];
};
exports.getQuestionsForTagType = getQuestionsForTagType;
const getTagTypeFromString = (tagTypeString) => {
    const upperCaseString = tagTypeString.toUpperCase();
    if (Object.values(QRTagType).includes(upperCaseString)) {
        return upperCaseString;
    }
    return null;
};
exports.getTagTypeFromString = getTagTypeFromString;
const getTagTypeDisplayName = (tagType) => {
    const displayNames = {
        [QRTagType.CAR_TAG]: 'Car Tag',
        [QRTagType.BIKE_TAG]: 'Bike Tag',
        [QRTagType.PET_TAG]: 'Pet Tag',
        [QRTagType.BAG_TAG]: 'Bag/Backpack/Luggage Tag',
        [QRTagType.TRAVEL_LUGGAGE_TAG]: 'Travel Luggage Tag',
        [QRTagType.GADGET_TAG]: 'Gadget Tag (Phone/Laptop/Tablet)',
        [QRTagType.DOCUMENT_TAG]: 'Document Tag (Passport, ID, Wallet)',
        [QRTagType.CHILD_TAG]: 'Child Safety Tag',
        [QRTagType.ELDERLY_TAG]: 'Elderly Care Tag',
        [QRTagType.PROPERTY_TAG]: 'Property Tag',
        [QRTagType.BUSINESS_TAG]: 'Business Tag',
        [QRTagType.VEHICLE_TAG]: 'Vehicle Tag (General)',
        [QRTagType.EMERGENCY_TAG]: 'Emergency Tag',
        [QRTagType.PERSONAL_ITEM_TAG]: 'Personal Item Tag',
        [QRTagType.MEDICAL_TAG]: 'Medical Tag',
        [QRTagType.SECURITY_TAG]: 'Security Tag',
        [QRTagType.DELIVERY_TAG]: 'Delivery Tag',
        [QRTagType.EVENT_TAG]: 'Event Tag',
        [QRTagType.CONTACT_TAG]: 'Contact Tag',
    };
    return displayNames[tagType] || tagType;
};
exports.getTagTypeDisplayName = getTagTypeDisplayName;
