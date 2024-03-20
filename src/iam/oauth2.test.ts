import nock from 'nock';
import {
  authorizeCode,
  introspect,
  loginAsUser,
  loginWithServiceAccount,
  logout,
  refreshAccessToken,
} from './oauth2';

const IAM_BASE_URL = 'http://localhost';
const TEST_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgHLmZ2jub8ltRLGDmOBmmfq0KbLQPWzyVqthviiSF3PNKnGo1frm
vc1ISze4p2DghI5Q8WOIVjCKMVsCUD57hTxB71aj9TmAbCbexohw5A/MHcmcXz4f
ce5sMb8Kp39jQrNDyHauEKFs5yMeB9v9j78PCNx0fhNUXpZbCFVi0uTVAgMBAAEC
gYAqJ+i28gxnncR/UKYNZveFqQZHiemPiFZOKN1o6zjZjuPMscJYfMIUiDq4pfIb
NCTORlpaR1JAGuPC3VVtp0oZc1/adIeBdO07/t4fyTb28op2Prui6bDjnO9zlL0v
5uqpHOmWJzF6PIQlfcd0QsZql0iFiNbxEGTTe7D8B7BQHQJBAMc2wEXzaezJ1BWG
UpTD62ttKKH0rXucyaTaf+vk8kH2gWz260SKf5GhaxoG7NqCQCRzO98zrht3msbq
bc0+CWcCQQCTpwLwL84Ehjz7CJXFvPoa2pb6ln9AG2XlUjyzihs1kB7OsAnodTiA
jDXnLwCCiSn66lLhMlBG0ZWLs3DH/W5jAkEAu3fpnqo/LyaLX6olAnwQieqShz5D
F4VnOKyqHuo3lB2OlGUU505SWFCIAlksAUD7bZHHcPcoTA7U54XqyG8t1wJAZe0f
ySCnDlaAmCa4BXXMDWeiW8AyfdWsBJ89ig8nc1VW/wVlAZSR+aNQvpOivXnkgfLq
Xcz2v7yEiJjJnTUk0wJAYKQXoBvSH/k78dsofai9MWd47u2F1qrPSOnRGDscN4hM
VXG06f4Q6WG0dEWgyCSWNDaqfWki9chpkgVD4Ib0fA==
-----END RSA PRIVATE KEY-----`;

describe('IAM OAuth2', () => {
  describe('loginWithServiceAccount', () => {
    it('should return a token', async () => {
      const scope = nock(IAM_BASE_URL)
        .post(
          '/authorize/oauth2/token',
          /grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=ey.*/,
        )
        .reply(200, {
          access_token: 'token',
          id_token: 'id_token',
          scope: 'scope',
          expires_in: 300,
          token_type: 'Bearer',
        });

      const response = await loginWithServiceAccount(IAM_BASE_URL, 'serviceId', TEST_PRIVATE_KEY);
      expect(scope.isDone()).toBeTruthy();
      expect(response.access_token).toEqual('token');
    });
  });

  describe('introspect', () => {
    it('should return introspect response', async () => {
      const scope = nock(IAM_BASE_URL, {
        reqheaders: {
          Authorization: 'Basic Y2xpZW50SWQ6Y2xpZW50U2VjcmV0',
        },
      })
        .post('/authorize/oauth2/introspect', 'token=token')
        .reply(200, {
          active: true,
        });

      const response = await introspect(IAM_BASE_URL, {
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        accessToken: 'token',
      });
      expect(scope.isDone()).toBeTruthy();
      expect(response.active).toEqual(true);
    });
  });

  describe('loginAsUser', () => {
    it('should return access token', async () => {
      const scope = nock(IAM_BASE_URL, {
        reqheaders: {
          Authorization: 'Basic Y2xpZW50SWQ6Y2xpZW50U2VjcmV0',
        },
      })
        .post(
          '/authorize/oauth2/token',
          'grant_type=password&username=username&password=password&scope=scope',
        )
        .reply(200, {
          access_token: 'token',
        });

      const response = await loginAsUser(IAM_BASE_URL, {
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        username: 'username',
        password: 'password',
        scope: 'scope',
      });
      expect(scope.isDone()).toBeTruthy();
      expect(response.access_token).toEqual('token');
    });
  });

  describe('refreshAccessToken', () => {
    it('should return access token', async () => {
      const scope = nock(IAM_BASE_URL, {
        reqheaders: {
          Authorization: 'Basic Y2xpZW50SWQ6Y2xpZW50U2VjcmV0',
        },
      })
        .post('/authorize/oauth2/token', 'grant_type=refresh_token&refresh_token=refreshToken')
        .reply(200, {
          access_token: 'token',
        });

      const response = await refreshAccessToken(IAM_BASE_URL, {
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        refreshToken: 'refreshToken',
      });
      expect(scope.isDone()).toBeTruthy();
      expect(response.access_token).toEqual('token');
    });
  });

  describe('logout', () => {
    it('should call hspd IAM endpoint', async () => {
      const scope = nock(IAM_BASE_URL, {
        reqheaders: {
          Authorization: 'Basic Y2xpZW50SWQ6Y2xpZW50U2VjcmV0',
        },
      })
        .post('/authorize/oauth2/revoke', 'token=token')
        .reply(200);

      await logout(IAM_BASE_URL, {
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        accessToken: 'token',
      });
      expect(scope.isDone()).toBeTruthy();
    });
  });

  describe('authorizeCode', () => {
    it('should return access token', async () => {
      const scope = nock(IAM_BASE_URL, {
        reqheaders: {
          Authorization: 'Basic Y2xpZW50SWQ6Y2xpZW50U2VjcmV0',
        },
      })
        .post(
          '/authorize/oauth2/token',
          'grant_type=authorization_code&code=code&redirect_uri=redirect_uri',
        )
        .reply(200, {
          access_token: 'token',
        });

      const response = await authorizeCode(IAM_BASE_URL, {
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        code: 'code',
        redirect_uri: 'redirect_uri',
      });
      expect(scope.isDone()).toBeTruthy();
      expect(response.access_token).toEqual('token');
    });
  });
});
