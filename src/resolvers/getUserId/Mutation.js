import password_1 from "@accounts/password";
import server_1 from "@accounts/server";
import hashPassword from "../../utils/hashPassword.js";

export default {
    createUser: async (_, { user }, ctx) => {
        const { injector, infos, collections } = ctx;
        const { Accounts, users, Groups } = collections;
        console.log("user", user);
        const accountsServer = injector.get(server_1.AccountsServer);
        const accountsPassword = injector.get(password_1.AccountsPassword);
        let userId;
        let groupId;
        const getGroup = await Groups.findOne({ name: "seller" });
        // console.log("getGroup ", getGroup);
        if (getGroup) {
            groupId = getGroup._id;
        } else {
            groupId = null;
        }
        // console.log(user);
        // user.push({
        //   groups: [groupId],
        // });
        // else{
        //     const nowDate = new Date();
        //     const newGroup = Object.assign({}, group, {
        //       _id: Random.id(),
        //       createdAt: nowDate,
        //     //   createdBy: accountId,
        //       shopId,
        //       slug: group.slug || getSlug(group.name),
        //       updatedAt: nowDate
        //     });
        // }
        try {
            userId = await accountsPassword.createUser(user);
        } catch (error) {
            // If ambiguousErrorMessages is true we obfuscate the email or username already exist error
            // to prevent user enumeration during user creation
            if (
                accountsServer.options.ambiguousErrorMessages &&
                error instanceof server_1.AccountsJsError &&
                (error.code === password_1.CreateUserErrors.EmailAlreadyExists ||
                    error.code === password_1.CreateUserErrors.UsernameAlreadyExists)
            ) {
                return {};
            }
            throw error;
        }

        // console.log("userId", userId);
        if (userId) {
            // console.log("user", user);
            const account = {
                _id: userId,
                acceptsMarketing: false,
                emails: [
                    {
                        address: user.email,
                        verified: false,
                        provides: "default",
                    },
                ],
                // groups: [groupId],
                name: user.firstName + " " + user.lastName,
                referralCode: user.referralCode,
                profile: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    dob: user.dob,
                    phone: user.phoneNumber ? user.phoneNumber : "",
                },
                shopId: null,
                state: "new",
                userId: userId,
                phoneNumber: user.phoneNumber,
            };
            const accountAdded = await Accounts.insertOne(account);

            // console.log("added account is ", accountAdded);
        }
        if (!accountsServer.options.enableAutologin) {
            return {
                userId: accountsServer.options.ambiguousErrorMessages ? null : userId,
            };
        }
        // When initializing AccountsServer we check that enableAutologin and ambiguousErrorMessages options
        // are not enabled at the same time
        const createdUser = await accountsServer.findUserById(userId);
        // console.log("createdUser ", createdUser);
        // If we are here - user must be created successfully
        // Explicitly saying this to Typescript compiler
        const loginResult = await accountsServer.loginWithUser(createdUser, infos);
        // console.log("loginResult ", loginResult);
        return {
            userId,
            loginResult,
        };
    },
    refreshTokens: async (_, args, ctx) => {
        const { accessToken, refreshToken } = args;
        const { injector, infos } = ctx;
        const refreshedSession = await injector
            .get(server_1.AccountsServer)
            .refreshTokens(accessToken, refreshToken, infos);
        return refreshedSession;
    },
    authenticate: async (_, args, ctx) => {
        const { serviceName, params } = args;
        const { injector, infos, collections } = ctx;
        const { users } = collections;
        const isOldUserFirstLogin = await users.findOne({
            "firstLogin": true,
            "emails.0.address": params?.user?.email,
        });

        console.log("params here", params)

        if (isOldUserFirstLogin) {

            const accountsServer = injector.get(server_1.AccountsServer);
            const accountsPassword = injector.get(password_1.AccountsPassword);
            await accountsPassword.sendResetPasswordEmail(params?.user?.email);
            throw new Error("Password update required, Check your regisetered email for reset password instructions");
        }

        const authenticated = await injector
            .get(server_1.AccountsServer)
            .loginWithService(serviceName, params, infos);
        return authenticated;
    },

    changePassword: async (
        _,
        { oldPassword, newPassword },
        { user, injector }
    ) => {
        if (!(user && user.id)) {
            throw new Error("Unauthorized");
        }
        const userId = user.id;
        let responsePassword = await injector
            .get(password_1.AccountsPassword)
            .changePassword(userId, oldPassword, newPassword);
        return true;
    },

    resetPassword: async (_, { token, newPassword }, { injector, infos, collections }) => {
        let resetPasswordResponse = null;
        const { users } = collections;

        try {

            const TokenUser = await users.findOne({
                "services.password.reset": {
                    $elemMatch: {
                        token: token
                    },

                },

            });
            resetPasswordResponse = await injector
                .get(password_1.AccountsPassword)
                .resetPassword(token, newPassword, infos);

            if (TokenUser && TokenUser?.firstLogin) {
                await users.updateOne({ _id: TokenUser?._id }, { $set: { "firstLogin": false } });
            }
            return resetPasswordResponse;
        }
        catch (err) {
            console.log(err)
            return resetPasswordResponse;
        }
    },

    sendResetPasswordEmail: async (_, { email }, { injector }) => {
        const accountsServer = injector.get(server_1.AccountsServer);
        const accountsPassword = injector.get(password_1.AccountsPassword);
        try {
            await accountsPassword.sendResetPasswordEmail(email);
        } catch (error) {
            // If ambiguousErrorMessages is true,
            // to prevent user enumeration we fail silently in case there is no user attached to this email
            if (
                accountsServer.options.ambiguousErrorMessages &&
                error instanceof server_1.AccountsJsError &&
                error.code === password_1.SendResetPasswordEmailErrors.UserNotFound
            ) {
                return null;
            }
            throw error;
        }
        return null;
    },

    getSellerToken: async (_, args, ctx) => {
        const { userId } = args;
        const { injector, infos, collections } = ctx;
        const accountsServer = injector.get(server_1.AccountsServer)
        const accountsPassword = injector.get(password_1.AccountsPassword)


        // const { users } = collections;


        const user = await accountsServer.findUserById(userId)
        const loginResult = await accountsServer.loginWithUser(user, infos)

        console.log("login Result is ", loginResult)
        return loginResult.tokens

        // const isOldUserFirstLogin = await users.findOne({
        //     "_id": userId,
        //     //   "emails.0.address": params?.user?.email,
        // });

        // console.log("params here", isOldUserFirstLogin)

        // if (isOldUserFirstLogin) {

        //   const accountsServer = injector.get(server_1.AccountsServer);
        //   const accountsPassword = injector.get(password_1.AccountsPassword);
        //   await accountsPassword.sendResetPasswordEmail(params?.user?.email);
        //   throw new Error("Password update required, Check your regisetered email for reset password instructions");
        // }

        // const params = {
        //     user: {
        //         email: isOldUserFirstLogin.emails[0].address,
        //     },
        //     password: hashPassword(isOldUserFirstLogin.services.password.bcrypt)
        // }
        // console.log("params here", params)


        // const authenticated = await injector
        //     .get(server_1.AccountsServer)
        //     .loginWithService("password", params, infos);


        // return authenticated;
    },
};
