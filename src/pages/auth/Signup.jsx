import React, {useEffect, useState, useContext} from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import {fiyoauthApiBaseUri} from '../../constants.js';
import customAxios from '../../utils/customAxios.js';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import UserContext from '../../context/items/UserContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const Signup = ({navigation}) => {
  const {isUserAuthenticated, setIsUserAuthenticated, setUserInfo} =
    useContext(UserContext);
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });
  const [alertText, setAlertText] = useState('');
  const [isError, setIsError] = useState(false);
  const [isCreateUserAccountReqLoading, setIsCreateUserAccountReqLoading] =
    useState(false);
  const [currentForm, setCurrentForm] = useState('signupForm1');
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
    const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);


  useEffect(() => {
    if (isUserAuthenticated) {
      navigation.navigate('Home');
    }
  }, [isUserAuthenticated, navigation]);

    const accountTypes = ['personal', 'creator', 'business'];


  const professionList = [
    'Accountant',
    'Account Manager',
    'Administrator',
    'Artist',
    'Architect',
    'Brand Manager',
    'Business Analyst',
    'Business Development Manager',
    'Chef',
    'Clinical Research Coordinator',
    'Compliance Officer',
    'Consultant',
    'Content Writer',
    'Copywriter',
    'Customer Service Representative',
    'Customer Success Manager',
    'Data Analyst',
    'Data Entry Clerk',
    'Data Scientist',
    'Dental Hygienist',
    'Doctor',
    'Electrician',
    'Engineer',
    'Entrepreneur',
    'Event Coordinator',
    'Event Planner',
    'Executive Assistant',
    'Executive Director',
    'Financial Advisor',
    'Financial Analyst',
    'Financial Consultant',
    'Financial Controller',
    'Financial Planner',
    'Graphic Designer',
    'HR Specialist',
    'Human Resources Manager',
    'Insurance Agent',
    'Interior Designer',
    'Investment Analyst',
    'Investment Banker',
    'IT Specialist',
    'Lawyer',
    'Legal Advisor',
    'Logistics Coordinator',
    'Market Research Analyst',
    'Marketing Coordinator',
    'Marketing Manager',
    'Marketing Specialist',
    'Mechanic',
    'Mechanical Engineer',
    'Musician',
    'Network Administrator',
    'Operations Analyst',
    'Operations Coordinator',
    'Operations Manager',
    'Personal Trainer',
    'Photographer',
    'Plumber',
    'Product Manager',
    'Project Administrator',
    'Project Coordinator',
    'Project Engineer',
    'Project Manager',
    'Public Relations Specialist',
    'Quality Assurance Specialist',
    'Real Estate Agent',
    'Recruiter',
    'Registered Nurse',
    'Research Analyst',
    'Researcher',
    'Sales Manager',
    'Sales Representative',
    'SEO Specialist',
    'Social Media Manager',
    'Social Worker',
    'Software Developer',
    'Software Engineer',
    'Software Tester',
    'Specialist',
    'Student',
    'Systems Analyst',
    'Teacher',
    'Technical Writer',
    'Therapist',
    'Translator',
    'UX/UI Designer',
    'Web Designer',
    'Writer',
    'Other',
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
      setAlertText(error.response?.data?.message || 'Internal Server Error');
      console.error(error);
      setIsError(true);
    } finally {
      setIsCreateUserAccountReqLoading(false);
    }
  };

  const SignupFirstSchema = Yup.object().shape({
    fullName: Yup.string().required('Full Name is required'),
    username: Yup.string().required('Username is required'),
  });

  const SignupSecondSchema = Yup.object().shape({
    accountType: Yup.string().required('Please select an Account type'),
  });

  const SignupThirdSchema = Yup.object().shape({
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const firstFormik = useFormik({
    initialValues: {
      fullName: '',
      username: '',
    },
    validationSchema: SignupFirstSchema,
    onSubmit: () => setCurrentForm('signupForm2'),
  });

  const secondFormik = useFormik({
    initialValues: {
      accountType: '',
    },
    validationSchema: SignupSecondSchema,
    onSubmit: () => setCurrentForm('signupForm3'),
  });

  const thirdFormik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: SignupThirdSchema,
    onSubmit: createUserAccount,
  });

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // Hide picker on iOS after selecting
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleAccountTypeSelection = (accountType) => {
    secondFormik.setFieldValue('accountType', accountType);
    setShowAccountTypeModal(false); // Close the modal after selection
  };
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.authMain}>
        <View style={styles.authForms}>
          <Text style={styles.welcomeBackText}>Hi Stranger!</Text>
          <Text style={styles.credentialsText}>
            Please let us know who you are
          </Text>
          {alertText ? (
            <View style={styles.alertContainer}>
              <Text style={styles.alertText}>{alertText}</Text>
            </View>
          ) : null}
          {currentForm === 'signupForm1' && (
            <View>
              <TextInput
                style={styles.textInput}
                placeholder="Full Name *"
                placeholderTextColor={'#ccc'}
                value={firstFormik.values.fullName}
                onChangeText={firstFormik.handleChange('fullName')}
                onBlur={firstFormik.handleBlur('fullName')}
              />
              {firstFormik.touched.fullName && firstFormik.errors.fullName ? (
                <Text style={styles.errorText}>{firstFormik.errors.fullName}</Text>
              ) : null}
              <TextInput
                style={styles.textInput}
                placeholder="Create Username *"
                placeholderTextColor={'#ccc'}
                value={firstFormik.values.username}
                onChangeText={firstFormik.handleChange('username')}
                onBlur={firstFormik.handleBlur('username')}
              />
              {firstFormik.touched.username && firstFormik.errors.username ? (
                <Text style={styles.errorText}>{firstFormik.errors.username}</Text>
              ) : null}
              <View style={styles.buttonContainer}>
                <View />
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={firstFormik.handleSubmit}>
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {currentForm === 'signupForm2' && (
            <View>
                <TouchableOpacity
                    style={styles.textInput}
                    onPress={showDatepicker}
                    >
                        <Text style={[styles.placeholder, { color: dob ? '#fff' : '#ccc'}]}>
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
              <View style={styles.selectContainer}>
                <View style={styles.selectItem}>
                <Text style={styles.label}>Account Type *</Text>
                    {/* Account Type Picker */}
                    <View style={styles.pickerContainer}>
                        {/* Use a dropdown picker component */}
                        <TouchableOpacity
                            onPress={() => {
                                setShowAccountTypeModal(true)
                            }}
                        >
                            <TextInput
                                style={styles.pickerInput}
                                editable={false}
                                value={secondFormik.values.accountType ? secondFormik.values.accountType : 'Select Account Type'}
                            />
                            {/* Render the arrow down icon if needed */}
                            <View style={styles.pickerIconContainer}>
                                <Text style={styles.pickerIcon}>▼</Text>
                             </View>
                        </TouchableOpacity>
                       {/* Modal for Account Type Selection */}
                       <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showAccountTypeModal}
                        onRequestClose={() => setShowAccountTypeModal(false)}
                       >
                         <View style={styles.modalOverlay}>
                           <View style={styles.modalContent}>
                            <FlatList
                                data={accountTypes}
                                keyExtractor={(item) => item}
                                renderItem={({item}) => (
                                   <TouchableOpacity
                                     style={styles.modalItem}
                                     onPress={() => handleAccountTypeSelection(item)}
                                  >
                                     <Text style={styles.modalItemText}>{item}</Text>
                                   </TouchableOpacity>
                                )}
                            />
                             <TouchableOpacity
                                style={styles.modalClose}
                                onPress={() => setShowAccountTypeModal(false)}
                              >
                                   <Text style={styles.modalCloseText}>Close</Text>
                             </TouchableOpacity>
                            </View>
                        </View>
                       </Modal>
                    </View>

                    {secondFormik.touched.accountType &&
                      secondFormik.errors.accountType ? (
                        <Text style={styles.errorText}>
                          {secondFormik.errors.accountType}
                        </Text>
                      ) : null}
                </View>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setCurrentForm('signupForm1')}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={secondFormik.handleSubmit}>
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {currentForm === 'signupForm3' && (
            <View>
              <TextInput
                style={styles.textInput}
                placeholder="Password *"
                placeholderTextColor={'#ccc'}
                secureTextEntry={!passwordVisibility.password}
                value={thirdFormik.values.password}
                onChangeText={thirdFormik.handleChange('password')}
                onBlur={thirdFormik.handleBlur('password')}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() =>
                  setPasswordVisibility({
                    ...passwordVisibility,
                    password: !passwordVisibility.password,
                  })
                }>
                <Text style={styles.eyeIconText}>
                  {passwordVisibility.password ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
              {thirdFormik.touched.password && thirdFormik.errors.password ? (
                <Text style={styles.errorText}>{thirdFormik.errors.password}</Text>
              ) : null}
              <TextInput
                style={styles.textInput}
                placeholder="Confirm Password *"
                secureTextEntry={!passwordVisibility.confirmPassword}
                value={thirdFormik.values.confirmPassword}
                onChangeText={thirdFormik.handleChange('confirmPassword')}
                onBlur={thirdFormik.handleBlur('confirmPassword')}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() =>
                  setPasswordVisibility({
                    ...passwordVisibility,
                    confirmPassword: !passwordVisibility.confirmPassword,
                  })
                }>
                    <Text style={styles.eyeIconText}>
                    {passwordVisibility.confirmPassword ? 'Hide' : 'Show'}
                  </Text>
              </TouchableOpacity>
              {thirdFormik.touched.confirmPassword &&
              thirdFormik.errors.confirmPassword ? (
                <Text style={styles.errorText}>
                  {thirdFormik.errors.confirmPassword}
                </Text>
              ) : null}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setCurrentForm('signupForm2');
                    setAlertText('');
                  }}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createAccountButton}
                  onPress={thirdFormik.handleSubmit}
                  disabled={isCreateUserAccountReqLoading}>
                  <Text style={styles.createAccountButtonText}>
                    {isCreateUserAccountReqLoading
                      ? 'Loading...'
                      : 'Create Account'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?  </Text>
            <TouchableOpacity onPress={() => navigation.navigate('AuthLogin')}>
              <Text style={styles.loginLink}>Login</Text>
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
  placeholder: {
    color: '#ccc',
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
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 25,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#0096ff',
  },
  nextButton: {
    backgroundColor: '#0096ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  nextButtonText: {
    color: 'white',
  },
  createAccountButton: {
    backgroundColor: '#0096ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  createAccountButtonText: {
    color: 'white',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  loginText: {
    color: '#fff',
  },
  loginLink: {
    color: '#0096ff',
  },
  selectContainer: {
    marginTop: 10,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#444',
  },
  selectItem: {
    flex: 1,
      paddingHorizontal: 10,
  },
    label: {
        fontSize: 16,
        color: '#ccc',
    },
  eyeIcon: {
      position: 'absolute',
      right: 10,
      top: 20,
  },
    eyeIconText: {
      color: '#ccc'
    },
    pickerContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    pickerInput: {
      flex: 1,
      color: '#fff',
      fontSize: 16,
    },
    pickerIconContainer: {
        paddingHorizontal: 5,
        paddingVertical: 12,
    },
    pickerIcon: {
        fontSize: 16,
        color: '#ccc',
        transform: [{ rotate: '180deg' }],
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
      padding: 20,
      borderRadius: 10,
       width: '80%',
    },
    modalItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#333',
    },
      modalItemText: {
          color: '#fff',
      },
    modalClose: {
        padding: 10,
        marginTop: 10,
        backgroundColor: '#333',
        alignItems: 'center',
        borderRadius: 5,
    },
    modalCloseText: {
        color: '#fff',
    },
});

export default Signup;