package com.freshmart.grocery.model;

public class Address {
    private String id;
    private String fullName;
    private String phone;
    private String street;
    private String apartment;
    private String city;
    private String state;
    private String pincode;
    private String landmark;
    private boolean isDefault;

    public Address() {}

    public Address(String id, String fullName, String phone, String street, String apartment, String city, String state, String pincode, String landmark, boolean isDefault) {
        this.id = id;
        this.fullName = fullName;
        this.phone = phone;
        this.street = street;
        this.apartment = apartment;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.landmark = landmark;
        this.isDefault = isDefault;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getApartment() { return apartment; }
    public void setApartment(String apartment) { this.apartment = apartment; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean aDefault) { isDefault = aDefault; }
}
