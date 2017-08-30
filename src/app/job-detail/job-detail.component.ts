import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';
import { JobService} from '../job.service';
import { Job } from '../job';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.css']
})
export class JobDetailComponent implements OnInit {
  job: Job;

  private cancelResult: string;
  private deleteResult: string;

  constructor(
    private http: HttpClient,
    private jobService: JobService,
    private modalService: NgbModal
  ) {
    IntervalObservable.create(500)
    .subscribe(() => {
      // Make the HTTP request:
      if (this.job != null) {
        this.jobService.getJob(this.job.id).subscribe(data => {
          // Read the result field from the JSON response.
          this.job = data;
        });
      }
    });
  }

  ngOnInit() {
    this.jobService.selectedJob.subscribe((value: Job) => {
      this.job = value;
      if (this.job != null) {
        this.jobService.getJob(this.job.id).subscribe(data => {
          this.job = data;
        });
      }
    });
  }

  keys(object): Array<string> {
    return Object.keys(object);
  }

  isFile(object): boolean {
    return (typeof object === 'object') && object.class === 'File';
  }

  isObject(object): boolean {
    return (typeof object === 'object');
  }

  deleteJob(dialog): void {
    this.modalService.open(dialog).result.then((result) => {
      this.jobService.deleteJob(this.job.id).subscribe(
        (success) => {
          console.log('Job delete request sent');
          this.jobService.setSelectedJob = null;
          this.jobService.updateList = true;
        },
        (error) => {
          console.log('Error deleting job: ' + error);
        }
      );
    }, (reason) => {
      // dismissed do nothing
    });
  }

  isCancelable(): boolean {
    if (this.job) {
      return this.job.state === 'Running' ||
             this.job.state === 'Waiting';
    } else {
      return false;
    }
  }

  cancelJob(dialog): void {
    this.modalService.open(dialog).result.then((result) => {
      this.jobService.cancelJob(this.job.id).subscribe(
        (success) => {
          console.log('Job cancel request sent');
          this.jobService.updateList = true;
        },
        (error) => {
          console.log('Error cancelling job: ' + error);
        }
      );
    }, (reason) => {
      // dismissed do nothing
    });
  }
}
