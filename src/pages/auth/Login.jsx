import React, {useState, useEffect, useContext} from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {fiyoauthApiBaseUri} from '../../constants.js';
import customAxios from '../../utils/customAxios.js';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import UserContext from '../../context/items/UserContext';
import {MMKV} from 'react-native-mmkv';

const mmkvStorage = new MMKV();

const Login = ({navigation}) => {
  const {isUserAuthenticated, setIsUserAuthenticated, setUserInfo} =
    useContext(UserContext);
  const [alertText, setAlertText] = useState('');
  const [isForgotPasswordClicked, setIsForgotPasswordClicked] = useState(false);
  const [isLoginUserAccountReqLoading, setIsLoginUserAccountReqLoading] =
    useState(false);

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required('Email or Username is required'),
    password: Yup.string().required('Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: values => {
      handleLoginUser(values);
    },
  });

  useEffect(() => {
    if (isUserAuthenticated) {
      navigation.navigate('Home');
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
      mmkvStorage.set('userInfo', JSON.stringify(response?.data?.data));
    } catch (error) {
      setAlertText(error.response?.data?.message || 'Something went wrong');
      setIsLoginUserAccountReqLoading(false);
      setIsUserAuthenticated(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setIsForgotPasswordClicked(true);
  };
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} id="login">
      <View style={styles.authMain}>
        <View style={styles.authForms}>
          <Text style={styles.welcomeBackText}>Welcome back!</Text>
          <Text style={styles.credentialsText}>
            Please enter your credentials to continue
          </Text>
          {alertText ? (
            <View style={styles.alertContainer}>
              <Text style={styles.alertText}>{alertText}</Text>
            </View>
          ) : null}
          <View>
            <TextInput
              style={styles.textInput}
              placeholder="Email or Username *"
              value={formik.values.username}
              onChangeText={formik.handleChange('username')}
              onBlur={formik.handleBlur('username')}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              autoCapitalize="none"
              placeholderTextColor={'#ccc'}
            />
            {formik.touched.username && formik.errors.username ? (
              <Text style={styles.errorText}>{formik.errors.username}</Text>
            ) : null}
            <TextInput
              style={styles.textInput}
              placeholder="Password *"
              secureTextEntry={true}
              value={formik.values.password}
              onChangeText={formik.handleChange('password')}
              onBlur={formik.handleBlur('password')}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              placeholderTextColor={'#ccc'}
            />
            {formik.touched.password && formik.errors.password ? (
              <Text style={styles.errorText}>{formik.errors.password}</Text>
            ) : null}
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleForgotPasswordClick}>
                <Text style={styles.forgotPasswordLink}>Forgot password?</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={formik.handleSubmit}
                disabled={isLoginUserAccountReqLoading}
                style={styles.loginButton}>
                <Text style={styles.loginButtonText}>
                  {isLoginUserAccountReqLoading ? 'Loading...' : 'Login'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account?  </Text>
              <TouchableOpacity onPress={() => navigation.navigate('AuthSignup')}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Music')}>
              <Text style={styles.musicText}>Enjoy music instead</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#121212',
  },
  authMain: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authForms: {
    width: '80%',
  },
  welcomeBackText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#fff',
  },
  credentialsText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  textInput: {
    height: 50,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 10,
    backgroundColor: '#333',
    color: '#fff',
  },
  errorText: {
    color: '#ff4d4d',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordLink: {
    color: '#0096ff',
    alignSelf: 'center',
  },
  loginButton: {
    backgroundColor: '#0096ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#fff',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  signUpText: {
    color: '#fff',
  },
  signUpLink: {
    color: '#0096ff',
  },
  musicText: {
    marginTop: 15,
    alignSelf: 'center',
    color: '#0096ff',
    textDecorationLine: 'underline',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  alertContainer: {
    backgroundColor: '#331a1a',
    borderLeftColor: '#ff4d4d',
    borderLeftWidth: 3,
    padding: 10,
    borderRadius: 7,
    marginTop: 20,
  },
  alertText: {
    color: '#ff4d4d',
    textAlign: 'center',
  },
});

export default Login;
