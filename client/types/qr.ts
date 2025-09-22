export enum QRType {
    OFFLINE_SHIP = "OFFLINE_SHIP",
    E_TAG = "E_TAG",
}

export const qrTypeMapping: Record<QRType, string> = {
    [QRType.OFFLINE_SHIP]: "Offline Ship",
    [QRType.E_TAG]: "E Tag",
};

export enum VehicleType {
    CAR = "CAR",
    BIKE = "BIKE",
}

export const vehicleTypeMapping: Record<VehicleType, string> = {
    [VehicleType.CAR]: "Car",
    [VehicleType.BIKE]: "Bike",
};
