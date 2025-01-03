import React, {useState, useEffect, useContext} from "react";
import {ScrollView, View, Text, TextInput} from "react-native";
import {TouchableOpacity} from "react-native-gesture-handler";
import {fiyoauthApiBaseUri} from "../../constants.js";
import customAxios from "../../utils/customAxios.js";
import * as Yup from "yup";
import {useFormik} from "formik";
import UserContext from "../../context/items/UserContext";
import {MMKV} from "react-native-mmkv";

const mmkvStorage = new MMKV();

const Login = ({navigation}) => {
  const {isUserAuthenticated, setIsUserAuthenticated, setUserInfo} =
    useContext(UserContext);
  const [alertText, setAlertText] = useState("");
  const [isForgotPasswordClicked, setIsForgotPasswordClicked] = useState(false);
  const [isLoginUserAccountReqLoading, setIsLoginUserAccountReqLoading] =
    useState(false);

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required("Email or Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: values => {
      handleLoginUser(values);
    },
  });

  useEffect(() => {
    if (isUserAuthenticated) {
      navigation.navigate("Home");
    }
  }, [isUserAuthenticated]);

  const handleLoginUser = async values => {
    setIsLoginUserAccountReqLoading(true);
    try {
      const response = await customAxios.post(
        `${fiyoauthApiBaseUri}/users/login`,
        {
          username: values.username,
          password: values.password,
        },
        {
          withCredentials: false,
        },
      );
      setIsUserAuthenticated(true);
      setIsLoginUserAccountReqLoading(false);
      setUserInfo(response?.data?.data);
      mmkvStorage.set("userInfo", JSON.stringify(response?.data?.data));
    } catch (error) {
      setAlertText(error.response?.data?.message || "Something went wrong");
      setIsLoginUserAccountReqLoading(false);
      setIsUserAuthenticated(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setIsForgotPasswordClicked(true);
  };

  return (
    <ScrollView
      contentContainerStyle={{flexGrow: 1, backgroundColor: "#121212"}}
      id="login">
      <View className="flex-1 justify-center items-center">
        <View className="w-4/5">
          <Text className="text-2xl font-bold mb-2 text-center text-white">
            Welcome back!
          </Text>
          <Text className="text-sm text-gray-400 text-center">
            Please enter your credentials to continue
          </Text>
          {alertText ? (
            <View className="bg-[#331a1a] border-l-[#ff4d4d] border-l-4 p-2 rounded-md mt-5">
              <Text className="text-[#ff4d4d] text-center">{alertText}</Text>
            </View>
          ) : null}
          <View className="my-5">
            <TextInput
              className="h-14 my-2 border-[#444] border rounded-md mt-3 px-2 bg-[#333] text-white"
              placeholder="Email or Username *"
              value={formik.values.username}
              onChangeText={formik.handleChange("username")}
              onBlur={formik.handleBlur("username")}
              autoCapitalize="none"
              placeholderTextColor={"#ccc"}
            />
            {formik.touched.username && formik.errors.username ? (
              <Text className="text-[#ff4d4d] mb-1">
                {formik.errors.username}
              </Text>
            ) : null}
            <TextInput
              className="h-14 my-2 border-[#444] border rounded-md mt-3 px-2 bg-[#333] text-white"
              placeholder="Password *"
              secureTextEntry={true}
              value={formik.values.password}
              onChangeText={formik.handleChange("password")}
              onBlur={formik.handleBlur("password")}
              placeholderTextColor={"#ccc"}
            />
            {formik.touched.password && formik.errors.password ? (
              <Text className="text-[#ff4d4d] mb-1">
                {formik.errors.password}
              </Text>
            ) : null}
            <View className="flex flex-row justify-between items-center mt-5">
              <TouchableOpacity onPress={handleForgotPasswordClick}>
                <Text className="text-[#0096ff] self-center">
                  Forgot password?
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={formik.handleSubmit}
                disabled={isLoginUserAccountReqLoading}>
                <Text className="text-white text-lg bg-[#0096ff] py-2 px-5 rounded-full">
                  {isLoginUserAccountReqLoading ? "Loading..." : "Login"}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex flex-row justify-center mt-7">
              <Text className="text-white">Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("AuthSignup")}>
                <Text className="text-[#0096ff]">Sign Up</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("Music")}>
              <Text className="text-[#0096ff] mt-4 text-center underline">
                Enjoy music instead
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Login;
