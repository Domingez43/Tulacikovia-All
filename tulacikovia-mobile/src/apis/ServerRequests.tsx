import axios, { AxiosHeaders, AxiosRequestConfig, AxiosResponse } from "axios";
import { Root, Toast } from 'react-native-popup-confirm-toast';
import url from 'url';

export interface RequestResult<T> {
    status: number;
    data?: T;
}

export class APIClient {

    static SERVER_API = 'https://api.relyonproject.com/' //'http://192.168.50.11:3033/';
    static SERVER_BFF = 'https://relyonproject.com/' //'http://192.168.50.11/';

    static async apiRequest<T = any>(endpoint: string, config?: AxiosRequestConfig<any> | undefined, token?: string, headers?: AxiosHeaders): Promise<RequestResult<T>> {
        try {
            var request = await axios({ url: this.SERVER_API + endpoint, headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...headers,
            }, ...config});
            return {status: request.status, data: request.data}
        } catch (ex: any) {
            return {status: 500, data: ex}
        }
    }

    static async bffRequest<T = any>(endpoint: string, config?: AxiosRequestConfig<any> | undefined, token?: string, headers?: AxiosHeaders): Promise<RequestResult<T>> {
        try {
            var request = await axios({ url: this.SERVER_BFF + endpoint, headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...headers,
            }, ...config});
            console.log(JSON.stringify(request));
            return {status: request.status, data: request.data}
        } catch (ex: any) {
            console.log(JSON.stringify(ex));
            return {status: 500, data: ex}
        }
    }

    static async uploadImage(image: string, token?: string): Promise<string> {
        const formData = new FormData();
        formData.append("image", ({ uri: image, name: 'content.jpg', type: 'multipart/form-data' } as any))
        var result = await APIClient.apiRequest('upload', {method: 'POST', data: formData, headers: { 'Content-Type': 'multipart/form-data'}}, token);
        return result.data.uri as string;
    }

    static isLocalUri(uri: string) {
        return /^file:\/\//.test(uri);
    }

    static async getImageInfo(uri: string, token?: string): Promise<{exists: boolean, size?: number, type?: string}> {
        if(APIClient.isLocalUri(uri)) return {exists: false, size: undefined, type: undefined}
        var name = uri.split('/').pop();
        console.log('Checking if file exists: ' + name);
        var result = await APIClient.apiRequest('getImageInfo?imageName=' + name , {method: 'GET'}, token);
        console.log('ImageInfoResult: ' + JSON.stringify(result));
        return result.data.contentInfo;
    }

    static buildEnpointWithQuery(funcName: string, query: any) {

        var params = Object.keys(query).map(key => {
            if(!query[key]) return;
            return key + '=' + query[key];
        })
        return funcName + '?' + params.filter(piece => piece != undefined).join('&');
    }

}