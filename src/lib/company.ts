export const COMPANY_REGISTERED = true;

export const COMPANY: {
  name: string;
  companyNumber: string;
  vatNumber: string;
  vatRegistered: boolean;
  addressLine: string;
  country: string;
  registeredOffice: string;
  phone: string | null;
  email: string;
  supportHours: string;
} = {
  name: "VELASTRIA OÜ",
  companyNumber: "17320178",
  vatNumber: "",
  vatRegistered: false,
  addressLine: "Tartu mnt 82, Kesklinna linnaosa, 10112 Tallinn, Harju maakond",
  country: "Estonia",
  registeredOffice: "Tartu mnt 82, Kesklinna linnaosa, 10112 Tallinn, Harju maakond",
  phone: null,
  email: "info@keyterminus.com",
  supportHours: "Mon–Fri, 09:00–18:00 (EET)",
};
