import customAxios from "./customAxios.js";
import { fiyoauthApiBaseUri } from "../constants.js";

export const getBulkUsersDetails = async (userIds) => {
  try {
    const { data: response } = await customAxios.post(
      `${fiyoauthApiBaseUri}/users/bulk`,
      {
        userIds,
      },
      {
        headers: {
          fiyoat: JSON.parse(localStorage.getItem("userInfo")).tokens.at,
        },
      },
    );
    const user = response.data;
    return user;
  } catch (error) {
    throw new Error(`Error in getBulkUsersDetails: ${error}`);
  }
};
