import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { Job } from './job';

@Injectable()
export class JobService {
  private _selectedJob: BehaviorSubject<Job>;

  constructor() {
    this._selectedJob = <BehaviorSubject<Job>>new BehaviorSubject(null);
  }

  get selectedJob() {
    return this._selectedJob.asObservable();
  }

  set setSelectedJob(job: Job) {
    this._selectedJob.next(job);
  }
}
