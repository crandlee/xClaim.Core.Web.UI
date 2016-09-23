export interface IAddress {
    id: string;
    address1: string;
    address2: string;
    address3: string;
    city: string;
    state: string;
    zipCode: string;
}

export interface IPaymentEntity {
    id: string;
    remittanceAddressId: string;
    remittanceAddress: IAddress;
    ein: string;
}

export interface IPaymentEntityViewModel {
    id: string;
    remittanceAddressId: string;
    remittanceAddress: IAddress;
    ein: string;
}