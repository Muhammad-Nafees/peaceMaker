import {EventRegister} from 'react-native-event-listeners';

// export const baseUrl = 'http://192.168.43.168:8000/api/';
// export const baseUrl = 'http://yameenyousuf.com/api/';
export const baseUrl = 'http://3.136.70.129/api/'; // <- prod
export const localBaseUrl = 'http://192.168.1.102:8000/api/';

export class ApiService {
  url = baseUrl;
  // url = 'https://orca-app-azjtu.ondigitalocean.app/';
  // url = 'http://10.0.2.2:3000/';
  Route = '';
  token = '';
  options = {};

  constructor(Route: string, token: string, local: boolean = false) {
    this.Route = Route;
    this.token = token;
    if (local) {
      this.url = localBaseUrl;
    }
  }

  Get = async () => {
    // Getting all data from table

    try {
      const response = await fetch(this.url + this.Route, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          accessToken: this.token,
        },
      });

      const Data = await response.json();

      if (response.status == 401) return EventRegister.emit('Logout', 'it works!!!');

      return {...Data, status: response.status};
    } catch (error) {
      console.log(error);
    }
  };

  GetById = async (Id: string) => {
    //Getting Data by id
    let address = this.url + this.Route + '/' + Id;

    try {
      const response = await fetch(address, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          accessToken: this.token,
        },
      });
      if (response.status == 401) return EventRegister.emit('Logout', 'it works!!!');
      const Data = await response.json();

      return Data;
    } catch (error) {
      console.error(error);
    }
  };

  GetByBody = async (Id: string | null) => {
    if (!Id) return;
    //Getting Data by id
    let address = this.url + this.Route;

    try {
      const response = await fetch(address, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          accessToken: this.token,
          body: JSON.stringify({userId: Id}),
        },
      });
      if (response.status == 401) return EventRegister.emit('Logout', 'it works!!!');
      const Data = await response.json();

      return {...Data, status: response.status};
    } catch (error) {
      console.error(error);
    }
  };

  Update = async (params: object) => {
    //Getting Data by id
    let address = this.url + this.Route;

    try {
      const response = await fetch(address, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          accessToken: this.token,
        },
        body: JSON.stringify(params),
      });
      if (response.status == 401) return EventRegister.emit('Logout', 'it works!!!');
      const Data = await response.json();

      return Data;
    } catch (error) {
      console.error(error);
    }
  };

  Post = async (params: object) => {
    try {
      const response = await fetch(this.url + this.Route, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accessToken: this.token,
        },
        body: JSON.stringify(params),
      });
      if (response.status == 401) return EventRegister.emit('Logout', 'it works!!!');
      const Data = await response.json();

      return await {...Data, status: response.status};
    } catch (error) {
      console.error(error);
    }
  };

  Put = async (params: any, isObj: boolean = true) => {
    const reqObj = isObj ? JSON.stringify(params) : params;
    const headers: HeadersInit | undefined = {
      accessToken: this.token,
    };
    if (isObj) {
      headers['content-type'] = 'application/json';
    }
    try {
      const response = await fetch(this.url + this.Route, {
        method: 'PUT',
        headers: headers,
        body: reqObj,
      });
      
      if (response.status == 401) return EventRegister.emit('Logout', 'it works!!!');
      const responseData = await response.json();

      return {...responseData, status: response.status};
    } catch (error) {
      console.error(error);
    }
  };

  //   PostById = async (params: object) => {
  //     //posting data by ID
  //     await this.getApiToken();

  //     try {
  //       const response = await fetch(this.url + this.Route, {
  //         method: 'POST',
  //         headers: {
  //           'x-token-auth': this.token,
  //           accept: 'application/json',
  //           'content-type': 'application/json',
  //         },
  //         body: JSON.stringify(params),
  //       });

  //       return await response;
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  UpdateById = async (params: object) => {
    //updating table by id

    try {
      const response = await fetch(this.url + this.Route, {
        method: 'PATCH',
        headers: {
          // 'x-token-auth': this.token,
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      if (response.status == 401) return EventRegister.emit('Logout', 'it works!!!');
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  };

  // UNSECURED REQUEST (NO AUTHORIZATION)

  unsecuredGet = async () => {
    //Getting Data by id
    let address = this.url + this.Route;

    console.log(address);

    try {
      const response = await fetch(address, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status == 401) return EventRegister.emit('Logout', 'it works!!!');
      const Data = await response.json();

      return Data;
    } catch (error) {
      console.error(error);
    }
  };

  unsecuredGetById = async (Id: string) => {
    //Getting Data by id
    let address = this.url + this.Route + '/' + Id;

    console.log(address);

    // await this.getApiToken();

    try {
      const response = await fetch(address, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status == 401) return EventRegister.emit('Logout', 'it works!!!');
      const Data = await response.json();

      return Data;
    } catch (error) {
      console.error(error);
    }
  };

  unsecuredPost = async (params: object, statusReq?: boolean) => {
    console.log(this.url + this.Route);

    try {
      const response = await fetch(this.url + this.Route, {
        method: 'POST',
        headers: {
          //   accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      if (response.status == 401) return EventRegister.emit('Logout', 'it works!!!');
      if (statusReq) {
        return response.status;
      }

      const Data = await response.json();

      return {...Data, status: response.status};
    } catch (error) {
      console.error(error);
    }
  };

  unsecuredPut = async (params: object, statusReq?: boolean) => {
    let address = this.url + this.Route;

    try {
      const response = await fetch(address, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      if (response.status == 401) return EventRegister.emit('Logout', 'it works!!!');
      if (statusReq) {
        return response.status;
      }

      const Data = await response.json();

      return {...Data, status: response.status};
    } catch (error) {
      console.error(error);
    }
  };

  unsecuredPatch = async (params: object) => {
    console.log(this.url + this.Route);

    try {
      const response = await fetch(this.url + this.Route, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      if (response.status == 401) return EventRegister.emit('Logout', 'it works!!!');
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  };
}
