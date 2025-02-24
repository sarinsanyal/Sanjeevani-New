// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract HospitalReferralSystem {
    address public admin;

    struct Hospital {
        string name;
        address hospitalAddress;
        uint availableBeds;
        bool isRegistered;
        uint[] pendingPatients;
    }

    struct Patient {
        uint id;
        string details;
        bool isAdmitted;
        string[] medicalReports;
        address currentHospital;
        uint referralCount;
        address[] requestedHospitals;
    }

    mapping(address => Hospital) public hospitals;
    mapping(address => Patient) public patients;
    mapping(address => bool) public isHospital;
    mapping(address => bool) public isPatient;

    event HospitalRegistered(string name, address indexed hospitalAddress, uint availableBeds);
    event PatientRegistered(address indexed patientAddress, uint patientId, string details);
    event PatientRequestedAdmission(address indexed patientAddress, uint indexed patientId, address[] requestedHospitals);
    event PatientAdmitted(uint indexed patientId, address indexed hospitalAddress);
    event PatientReferred(uint indexed patientId, address indexed newHospital);
    event PatientRejected(uint indexed patientId, address indexed hospitalAddress);
    event MedicalReportUploaded(uint indexed patientId, string ipfsHash);
    event PatientDischarged(uint indexed patientId, address indexed hospitalAddress);

    modifier onlyHospital() {
        require(isHospital[msg.sender], "Only registered hospitals can call this function");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerHospital(string memory _name, uint _availableBeds) public {
        require(!isHospital[msg.sender], "Hospital already registered");
        uint[] memory emptyPendingPatients;
        hospitals[msg.sender] = Hospital({
            name: _name,
            hospitalAddress: msg.sender,
            availableBeds: _availableBeds,
            isRegistered: true,
            pendingPatients: emptyPendingPatients    });

        isHospital[msg.sender] = true;
        emit HospitalRegistered(_name, msg.sender, _availableBeds);
    }

    function registerPatient(uint patientId, string memory patientDetails) public {
        require(!isPatient[msg.sender], "Patient already registered");

        string[] memory emptyMedicalReports;
        address[] memory emptyHospitals;

        patients[msg.sender] = Patient({
            id: patientId,
            details: patientDetails,
            isAdmitted: false,
            medicalReports: emptyMedicalReports,
            currentHospital: address(0),
            referralCount: 0,
            requestedHospitals: emptyHospitals
        });

        isPatient[msg.sender] = true;
        emit PatientRegistered(msg.sender, patientId, patientDetails);
    }

    function requestAdmission(address[] memory hospitalAddresses) public {
        require(isPatient[msg.sender], "You must register as a patient first");
        require(hospitalAddresses.length > 0, "No hospitals specified");

        for (uint i = 0; i < hospitalAddresses.length; i++) {
            require(hospitals[hospitalAddresses[i]].isRegistered, "One or more hospitals are not registered");
        }

        // Append new hospital requests instead of replacing
        for (uint i = 0; i < hospitalAddresses.length; i++) {
            patients[msg.sender].requestedHospitals.push(hospitalAddresses[i]);
            hospitals[hospitalAddresses[i]].pendingPatients.push(patients[msg.sender].id);
        }

        emit PatientRequestedAdmission(msg.sender, patients[msg.sender].id, hospitalAddresses);
    }

    function admitPatient(address patientAddress) public onlyHospital {
        require(!patients[patientAddress].isAdmitted, "Patient already admitted");
        require(hospitals[msg.sender].availableBeds > 0, "No available beds");

        bool found = false;

        for (uint i = 0; i < patients[patientAddress].requestedHospitals.length; i++) {
            if (patients[patientAddress].requestedHospitals[i] == msg.sender) {
                found = true;
                break;
            }
        }
        require(found, "Patient did not request admission to this hospital");

        patients[patientAddress].isAdmitted = true;
        patients[patientAddress].currentHospital = msg.sender;
        hospitals[msg.sender].availableBeds--;

        // Remove patient from pending lists of all hospitals
        for (uint i = 0; i < patients[patientAddress].requestedHospitals.length; i++) {
            address hospital = patients[patientAddress].requestedHospitals[i];
            if (hospital != msg.sender) {
                removePendingPatient(hospital, patients[patientAddress].id);
            }
        }

        // Clear patient's requested hospital list
        delete patients[patientAddress].requestedHospitals;

        emit PatientAdmitted(patients[patientAddress].id, msg.sender);
    }

    function removePendingPatient(address hospital, uint patientId) internal {
   uint[] storage pendingList = hospitals[hospital].pendingPatients;
    uint length = pendingList.length;

    for (uint i = 0; i < length; i++) {
        if (pendingList[i] == patientId) {
            // Move the last element to the deleted position and pop the last element
            pendingList[i] = pendingList[length - 1];
            pendingList.pop();
            break;
        }
    }
    }

    function rejectPatient(address patientAddress) public onlyHospital {
        require(!patients[patientAddress].isAdmitted, "Patient already admitted");

        bool found = false;

        for (uint i = 0; i < patients[patientAddress].requestedHospitals.length; i++) {
            if (patients[patientAddress].requestedHospitals[i] == msg.sender) {
                found = true;
                break;
            }
        }
        require(found, "Patient did not request admission to this hospital");

        removePendingPatient(msg.sender, patients[patientAddress].id);

        // Remove this hospital from patient's requested list
        for (uint i = 0; i < patients[patientAddress].requestedHospitals.length; i++) {
            if (patients[patientAddress].requestedHospitals[i] == msg.sender) {
                patients[patientAddress].requestedHospitals[i] = patients[patientAddress].requestedHospitals[
                    patients[patientAddress].requestedHospitals.length - 1
                ];
                patients[patientAddress].requestedHospitals.pop();
                break;
            }
        }

        // If no hospitals left, reset request status
        if (patients[patientAddress].requestedHospitals.length == 0) {
            patients[patientAddress].isAdmitted = false;
        }

        emit PatientRejected(patients[patientAddress].id, msg.sender);
    }

    function dischargePatient(address patientAddress) public onlyHospital {
        require(patients[patientAddress].isAdmitted, "Patient not admitted");
        patients[patientAddress].isAdmitted = false;
        hospitals[msg.sender].availableBeds++;

        emit PatientDischarged(patients[patientAddress].id, msg.sender);
    }

    function getPendingPatients() public view onlyHospital returns (uint[] memory) {
        return hospitals[msg.sender].pendingPatients;
    }

    function uploadMedicalReport(address patientAddress, string memory ipfsHash) public onlyHospital {
        require(patients[patientAddress].isAdmitted, "Patient not admitted");
        patients[patientAddress].medicalReports.push(ipfsHash);
        emit MedicalReportUploaded(patients[patientAddress].id, ipfsHash);
    }

    function getMedicalReports(address patientAddress) public view returns (string[] memory) {
        require(msg.sender == patients[patientAddress].currentHospital || msg.sender == admin, "Unauthorized access");
        return patients[patientAddress].medicalReports;
    }
}