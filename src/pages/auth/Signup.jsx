import React, {useEffect, useState, useContext} from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import {fiyoauthApiBaseUri} from "../../constants.js";
import customAxios from "../../utils/customAxios.js";
import * as Yup from "yup";
import {useFormik} from "formik";
import UserContext from "../../context/items/UserContext";
import DateTimePicker from "@react-native-community/datetimepicker";

const Signup = ({navigation}) => {
  const {isUserAuthenticated, setIsUserAuthenticated, setUserInfo} =
    useContext(UserContext);
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });
  const [alertText, setAlertText] = useState("");
  const [isError, setIsError] = useState(false);
  const [isCreateUserAccountReqLoading, setIsCreateUserAccountReqLoading] =
    useState(false);
  const [currentForm, setCurrentForm] = useState("signupForm1");
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);

  useEffect(() => {
    if (isUserAuthenticated) {
      navigation.navigate("Home");
    }
  }, [isUserAuthenticated, navigation]);

  const accountTypes = ["personal", "creator", "business"];

  const professionList = [
    "Accountant",
    "Account Manager",
    "Administrator",
    "Artist",
    "Architect",
    "Brand Manager",
    "Business Analyst",
    "Business Development Manager",
    "Chef",
    "Clinical Research Coordinator",
    "Compliance Officer",
    "Consultant",
    "Content Writer",
    "Copywriter",
    "Customer Service Representative",
    "Customer Success Manager",
    "Data Analyst",
    "Data Entry Clerk",
    "Data Scientist",
    "Dental Hygienist",
    "Doctor",
    "Electrician",
    "Engineer",
    "Entrepreneur",
    "Event Coordinator",
    "Event Planner",
    "Executive Assistant",
    "Executive Director",
    "Financial Advisor",
    "Financial Analyst",
    "Financial Consultant",
    "Financial Controller",
    "Financial Planner",
    "Graphic Designer",
    "HR Specialist",
    "Human Resources Manager",
    "Insurance Agent",
    "Interior Designer",
    "Investment Analyst",
    "Investment Banker",
    "IT Specialist",
    "Lawyer",
    "Legal Advisor",
    "Logistics Coordinator",
    "Market Research Analyst",
    "Marketing Coordinator",
    "Marketing Manager",
    "Marketing Specialist",
    "Mechanic",
    "Mechanical Engineer",
    "Musician",
    "Network Administrator",
    "Operations Analyst",
    "Operations Coordinator",
    "Operations Manager",
    "Personal Trainer",
    "Photographer",
    "Plumber",
    "Product Manager",
    "Project Administrator",
    "Project Coordinator",
    "Project Engineer",
    "Project Manager",
    "Public Relations Specialist",
    "Quality Assurance Specialist",
    "Real Estate Agent",
    "Recruiter",
    "Registered Nurse",
    "Research Analyst",
    "Researcher",
    "Sales Manager",
    "Sales Representative",
    "SEO Specialist",
    "Social Media Manager",
    "Social Worker",
    "Software Developer",
    "Software Engineer",
    "Software Tester",
    "Specialist",
    "Student",
    "Systems Analyst",
    "Teacher",
    "Technical Writer",
    "Therapist",
    "Translator",
    "UX/UI Designer",
    "Web Designer",
    "Writer",
    "Other",
  ];

  const createUserAccount = async () => {
    setIsCreateUserAccountReqLoading(true);
    try {
      const response = await customAxios.post(
        `${fiyoauthApiBaseUri}/users/register`,
        {
          ...firstFormik.values,
          ...secondFormik.values,
          dob: dob.toISOString(),
          ...thirdFormik.values,
        },
      );
      setAlertText(response.data.message);
      setIsUserAuthenticated(true);
      setIsError(false);
      setUserInfo(response.data.data);
    } catch (error) {
      setAlertText(error.response?.data?.message || "Internal Server Error");
      console.error(error);
      setIsError(true);
    } finally {
      setIsCreateUserAccountReqLoading(false);
    }
  };

  const SignupFirstSchema = Yup.object().shape({
    fullName: Yup.string().required("Full Name is required"),
    username: Yup.string().required("Username is required"),
  });

  const SignupSecondSchema = Yup.object().shape({
    accountType: Yup.string().required("Please select an Account type"),
  });

  const SignupThirdSchema = Yup.object().shape({
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const firstFormik = useFormik({
    initialValues: {
      fullName: "",
      username: "",
    },
    validationSchema: SignupFirstSchema,
    onSubmit: () => setCurrentForm("signupForm2"),
  });

  const secondFormik = useFormik({
    initialValues: {
      accountType: "",
    },
    validationSchema: SignupSecondSchema,
    onSubmit: () => setCurrentForm("signupForm3"),
  });

  const thirdFormik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: SignupThirdSchema,
    onSubmit: createUserAccount,
  });

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleAccountTypeSelection = accountType => {
    secondFormik.setFieldValue("accountType", accountType);
    setShowAccountTypeModal(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{flexGrow: 1, backgroundColor: "#121212"}}
      id="signup">
      <View className="flex-1 justify-center items-center">
        <View className="w-4/5">
          <Text className="text-2xl font-bold mb-2 text-center text-white">
            Hi Stranger!
          </Text>
          <Text className="text-sm text-gray-400 text-center">
            Please let us know who you are
          </Text>
          {alertText ? (
            <View className="bg-[#331a1a] border-l-[#ff4d4d] border-l-4 p-2 rounded-md mt-5">
              <Text className="text-[#ff4d4d] text-center">{alertText}</Text>
            </View>
          ) : null}
          {currentForm === "signupForm1" && (
            <View className="my-5">
              <TextInput
                className="h-14 my-2 border-[#444] border rounded-md px-2 bg-[#333] text-white"
                placeholder="Full Name *"
                placeholderTextColor={"#ccc"}
                value={firstFormik.values.fullName}
                onChangeText={firstFormik.handleChange("fullName")}
                onBlur={firstFormik.handleBlur("fullName")}
              />
              {firstFormik.touched.fullName && firstFormik.errors.fullName ? (
                <Text className="text-[#ff4d4d] mb-1">
                  {firstFormik.errors.fullName}
                </Text>
              ) : null}
              <TextInput
                className="h-14 my-2 border-[#444] border rounded-md px-2 bg-[#333] text-white"
                placeholder="Create Username *"
                placeholderTextColor={"#ccc"}
                value={firstFormik.values.username}
                onChangeText={firstFormik.handleChange("username")}
                onBlur={firstFormik.handleBlur("username")}
              />
              {firstFormik.touched.username && firstFormik.errors.username ? (
                <Text className="text-[#ff4d4d] mb-1">
                  {firstFormik.errors.username}
                </Text>
              ) : null}
              <View className="flex flex-row justify-between items-center mt-5">
                <View />
                <TouchableOpacity
                  className="bg-[#0096ff] py-2 px-5 rounded-full"
                  onPress={firstFormik.handleSubmit}>
                  <Text className="text-white">Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {currentForm === "signupForm2" && (
            <View className="my-5">
              <TouchableOpacity
                className="h-14 my-2 border-[#444] border rounded-md px-2 bg-[#333] text-white flex justify-center"
                onPress={showDatepicker}>
                <Text
                  className={`text-lg  ${
                    dob ? "text-white" : "text-gray-500"
                  }`}>
                  {dob ? dob.toLocaleDateString() : "Date of Birth *"}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dob}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
              <View className="my-2 border-[#444] border rounded-md">
                <Text className="text-gray-500 text-sm ml-2">
                  Account Type *
                </Text>
                <TouchableOpacity
                  className="p-2 flex flex-row items-center"
                  onPress={() => setShowAccountTypeModal(true)}>
                  <Text className="text-white text-lg flex-1">
                    {secondFormik.values.accountType || "Select Account Type"}
                  </Text>
                  <Text className="text-gray-500 text-lg">▼</Text>
                </TouchableOpacity>

                {/* Modal for Account Type Selection */}
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={showAccountTypeModal}
                  onRequestClose={() => setShowAccountTypeModal(false)}>
                  <View className="flex-1 justify-center items-center bg-[rgba(0,0,0,0.5)]">
                    <View className="bg-[#1a1a1a] p-5 rounded-md w-4/5">
                      <FlatList
                        data={accountTypes}
                        keyExtractor={item => item}
                        renderItem={({item}) => (
                          <TouchableOpacity
                            className="p-2 border-b border-[#333]"
                            onPress={() => handleAccountTypeSelection(item)}>
                            <Text className="text-white">{item}</Text>
                          </TouchableOpacity>
                        )}
                      />
                      <TouchableOpacity
                        className="mt-2 p-2 bg-[#333] items-center rounded-md"
                        onPress={() => setShowAccountTypeModal(false)}>
                        <Text className="text-white">Close</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              </View>

              {secondFormik.touched.accountType &&
              secondFormik.errors.accountType ? (
                <Text className="text-[#ff4d4d] mb-1">
                  {secondFormik.errors.accountType}
                </Text>
              ) : null}
              <View className="flex flex-row justify-between items-center mt-5">
                <TouchableOpacity
                  className="py-2 px-2 self-center"
                  onPress={() => setCurrentForm("signupForm1")}>
                  <Text className="text-[#0096ff]">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-[#0096ff] py-2 px-5 rounded-full"
                  onPress={secondFormik.handleSubmit}>
                  <Text className="text-white">Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {currentForm === "signupForm3" && (
            <View className="my-5">
              <TextInput
                className="h-14 my-2 border-[#444] border rounded-md px-2 bg-[#333] text-white"
                placeholder="Password *"
                placeholderTextColor={"#ccc"}
                secureTextEntry={!passwordVisibility.password}
                value={thirdFormik.values.password}
                onChangeText={thirdFormik.handleChange("password")}
                onBlur={thirdFormik.handleBlur("password")}
              />
              <TouchableOpacity
                className="absolute right-3 top-6"
                onPress={() =>
                  setPasswordVisibility({
                    ...passwordVisibility,
                    password: !passwordVisibility.password,
                  })
                }>
                <Text className="text-gray-500 text-sm">
                  {passwordVisibility.password ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
              {thirdFormik.touched.password && thirdFormik.errors.password ? (
                <Text className="text-[#ff4d4d] mb-1">
                  {thirdFormik.errors.password}
                </Text>
              ) : null}
              <TextInput
                className="h-14 my-2 border-[#444] border rounded-md px-2 bg-[#333] text-white"
                placeholder="Confirm Password *"
                secureTextEntry={!passwordVisibility.confirmPassword}
                value={thirdFormik.values.confirmPassword}
                onChangeText={thirdFormik.handleChange("confirmPassword")}
                onBlur={thirdFormik.handleBlur("confirmPassword")}
              />
              <TouchableOpacity
                className="absolute right-3 top-6"
                onPress={() =>
                  setPasswordVisibility({
                    ...passwordVisibility,
                    confirmPassword: !passwordVisibility.confirmPassword,
                  })
                }>
                <Text className="text-gray-500 text-sm">
                  {passwordVisibility.confirmPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
              {thirdFormik.touched.confirmPassword &&
              thirdFormik.errors.confirmPassword ? (
                <Text className="text-[#ff4d4d] mb-1">
                  {thirdFormik.errors.confirmPassword}
                </Text>
              ) : null}
              <View className="flex flex-row justify-between items-center mt-5">
                <TouchableOpacity
                  className="py-2 px-2 self-center"
                  onPress={() => {
                    setCurrentForm("signupForm2");
                    setAlertText("");
                  }}>
                  <Text className="text-[#0096ff]">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-[#0096ff] py-2 px-5 rounded-full"
                  onPress={thirdFormik.handleSubmit}
                  disabled={isCreateUserAccountReqLoading}>
                  <Text className="text-white">
                    {isCreateUserAccountReqLoading
                      ? "Loading..."
                      : "Create Account"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <View className="flex flex-row justify-center mt-7">
            <Text className="text-white">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("AuthLogin")}>
              <Text className="text-[#0096ff]">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Signup;
