import { WebRequest } from "./webRequest";
import type { Nullable } from "../types";
import type { IOfflineProvider } from "../Offline/IOfflineProvider";
import type { IFileRequest } from "./fileRequest";
import { RuntimeError } from "./error";
/** @ignore */
export declare class LoadFileError extends RuntimeError {
    request?: WebRequest;
    file?: File;
    /**
     * Creates a new LoadFileError
     * @param message defines the message of the error
     * @param object defines the optional web request
     */
    constructor(message: string, object?: WebRequest | File);
}
/** @ignore */
export declare class RequestFileError extends RuntimeError {
    request: WebRequest;
    /**
     * Creates a new LoadFileError
     * @param message defines the message of the error
     * @param request defines the optional web request
     */
    constructor(message: string, request: WebRequest);
}
/** @ignore */
export declare class ReadFileError extends RuntimeError {
    file: File;
    /**
     * Creates a new ReadFileError
     * @param message defines the message of the error
     * @param file defines the optional file
     */
    constructor(message: string, file: File);
}
/**
 * @hidden
 */
export declare const FileToolsOptions: {
    DefaultRetryStrategy: (url: string, request: WebRequest, retryIndex: number) => number;
    BaseUrl: string;
    CorsBehavior: string | ((url: string | string[]) => string);
    PreprocessUrl: (url: string) => string;
};
/**
 * Sets the cors behavior on a dom element. This will add the required Tools.CorsBehavior to the element.
 * @param url define the url we are trying
 * @param element define the dom element where to configure the cors policy
 * @param element.crossOrigin
 * @hidden
 */
export declare const SetCorsBehavior: (url: string | string[], element: {
    crossOrigin: string | null;
}) => void;
/**
 * Loads an image as an HTMLImageElement.
 * @param input url string, ArrayBuffer, or Blob to load
 * @param onLoad callback called when the image successfully loads
 * @param onError callback called when the image fails to load
 * @param offlineProvider offline provider for caching
 * @param mimeType optional mime type
 * @param imageBitmapOptions
 * @returns the HTMLImageElement of the loaded image
 * @hidden
 */
export declare const LoadImage: (input: string | ArrayBuffer | ArrayBufferView | Blob, onLoad: (img: HTMLImageElement | ImageBitmap) => void, onError: (message?: string | undefined, exception?: any) => void, offlineProvider: Nullable<IOfflineProvider>, mimeType?: string, imageBitmapOptions?: ImageBitmapOptions | undefined) => Nullable<HTMLImageElement>;
/**
 * Reads a file from a File object
 * @param file defines the file to load
 * @param onSuccess defines the callback to call when data is loaded
 * @param onProgress defines the callback to call during loading process
 * @param useArrayBuffer defines a boolean indicating that data must be returned as an ArrayBuffer
 * @param onError defines the callback to call when an error occurs
 * @returns a file request object
 * @hidden
 */
export declare const ReadFile: (file: File, onSuccess: (data: any) => void, onProgress?: ((ev: ProgressEvent) => any) | undefined, useArrayBuffer?: boolean | undefined, onError?: ((error: ReadFileError) => void) | undefined) => IFileRequest;
/**
 * Loads a file from a url, a data url, or a file url
 * @param fileOrUrl file, url, data url, or file url to load
 * @param onSuccess callback called when the file successfully loads
 * @param onProgress callback called while file is loading (if the server supports this mode)
 * @param offlineProvider defines the offline provider for caching
 * @param useArrayBuffer defines a boolean indicating that date must be returned as ArrayBuffer
 * @param onError callback called when the file fails to load
 * @param onOpened
 * @returns a file request object
 * @hidden
 */
export declare const LoadFile: (fileOrUrl: File | string, onSuccess: (data: string | ArrayBuffer, responseURL?: string | undefined) => void, onProgress?: ((ev: ProgressEvent) => void) | undefined, offlineProvider?: IOfflineProvider | undefined, useArrayBuffer?: boolean | undefined, onError?: ((request?: WebRequest | undefined, exception?: LoadFileError | undefined) => void) | undefined, onOpened?: ((request: WebRequest) => void) | undefined) => IFileRequest;
/**
 * Loads a file from a url
 * @param url url to load
 * @param onSuccess callback called when the file successfully loads
 * @param onProgress callback called while file is loading (if the server supports this mode)
 * @param offlineProvider defines the offline provider for caching
 * @param useArrayBuffer defines a boolean indicating that date must be returned as ArrayBuffer
 * @param onError callback called when the file fails to load
 * @param onOpened callback called when the web request is opened
 * @returns a file request object
 * @hidden
 */
export declare const RequestFile: (url: string, onSuccess?: ((data: string | ArrayBuffer, request?: WebRequest | undefined) => void) | undefined, onProgress?: ((event: ProgressEvent) => void) | undefined, offlineProvider?: IOfflineProvider | undefined, useArrayBuffer?: boolean | undefined, onError?: ((error: RequestFileError) => void) | undefined, onOpened?: ((request: WebRequest) => void) | undefined) => IFileRequest;
/**
 * Checks if the loaded document was accessed via `file:`-Protocol.
 * @returns boolean
 * @hidden
 */
export declare const IsFileURL: () => boolean;
/**
 * Test if the given uri is a valid base64 data url
 * @param uri The uri to test
 * @return True if the uri is a base64 data url or false otherwise
 * @hidden
 */
export declare const IsBase64DataUrl: (uri: string) => boolean;
/**
 * Decode the given base64 uri.
 * @param uri The uri to decode
 * @return The decoded base64 data.
 * @hidden
 */
export declare function DecodeBase64UrlToBinary(uri: string): ArrayBuffer;
/**
 * Decode the given base64 uri into a UTF-8 encoded string.
 * @param uri The uri to decode
 * @return The decoded base64 data.
 * @hidden
 */
export declare const DecodeBase64UrlToString: (uri: string) => string;
