import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { Job } from './job';
import {WebDAV, Headers} from 'angular-webdav';
import {HttpClient, HttpHeaders} from '@angular/common/http';

export interface WorkflowInput {
  [x: string]: object;
}

export interface JobDescription {
  name: string;
  input: WorkflowInput;
  workflow: string;
}

@Injectable()
export class JobService {
  private _selectedJob: BehaviorSubject<Job>;
  private _updateList: BehaviorSubject<boolean>;
  private api = 'http://localhost:8080/jobs';
  private webdav_url = 'http://localhost:5050/';

  constructor(
    private http: HttpClient,
    private webdav: WebDAV
  ) {
    this._selectedJob = <BehaviorSubject<Job>>new BehaviorSubject(null);
    this._updateList = <BehaviorSubject<boolean>>new BehaviorSubject(false);
  }

  get selectedJob() {
    return this._selectedJob.asObservable();
  }

  set setSelectedJob(job: Job) {
    this._selectedJob.next(job);
  }

  get webdavUrl(): string {
    return this.webdav_url;
  }

  set updateList(update: boolean) {
    if (this._updateList.value !== update) {
      this._updateList.next(update);
    }
  }

  get getUpdateListObserver(): Observable<boolean> {
    return this._updateList.asObservable();
  }

  getJob(jobId: string): Observable<Job> {
    return this.http.get<Job>(this.api + '/' + jobId);
  }

  getAllJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.api);
  }

  createDir(dirname: string): Promise<boolean> {
    const dir_url = this.webdav_url + '/' + dirname + '/';
    const headers = new Headers();
    const httpHeaders = new HttpHeaders();
    // headers.append('Authorization', 'Basic d2ViZGF2OnZhZGJldw==');
    // httpHeaders.append('Authorization', 'Basic d2ViZGF2OnZhZGJldw==');
    return new Promise<boolean>((resolve, reject) => {
      this.http.get(dir_url, {headers: httpHeaders}).subscribe(
        (value) => {
          resolve(true);
        },
        (error) => {
          if (error.status === 404) {
            this.webdav.mkcol(dir_url, {headers: headers}).subscribe(
              (value) => {
                resolve(true);
              },
              (err2) => {
                reject(err2);
              }
            );
          } else {
            reject(error);
          }
        });
    });
  }

  uploadFile(id, file, dirname): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = readfile => {
        const contents: any = readfile.target;
        const body = contents.result;

        const header =  new Headers();
        header.append('Content-Type', 'application/octet-stream');
        this.webdav.put(`${this.webdav_url}/${dirname}/${file.name}`, body, {headers: header})
          .subscribe(
            (value) => {
              console.log('Succesfully uploaded file: ' + file.name);
              resolve(true);
            },
            (error) => {
              console.log(error);
              reject(error);
            }
          );
      };
      reader.readAsArrayBuffer(file);
    });
  }

  submitJob(jobDescription: JobDescription): Observable<Object> {
    return this.http.post(this.api, jobDescription);
  }

  deleteJob(jobId: string): Observable<Object> {
    return this.http.delete(this.api + '/' + jobId);
  }

  cancelJob(jobId: string): Observable<Object> {
    return this.http.post(this.api + '/' + jobId + '/cancel', null);
  }
}
