import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JobService } from '../job.service';
import { Job } from '../job';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {

  jobs: Job[];

  constructor(
    private http: HttpClient,
    private jobService: JobService
  ) { }

  ngOnInit() {
    this.jobService.getAllJobs().subscribe(data => {
      // Read the result field from the JSON response.
      this.jobs = data;
    });
    IntervalObservable.create(10000)
      .subscribe(() => {
        // Make the HTTP request:
        this.jobService.getAllJobs().subscribe(data => {
          // Read the result field from the JSON response.
          this.jobs = data;
        });
      });

    this.jobService.getUpdateListObserver.subscribe((value) => {
      if (value) {
        setTimeout(() => {
          this.jobService.getAllJobs().subscribe(data => {
            // Read the result field from the JSON response.
            this.jobs = data;
          });
          this.jobService.updateList = false;
        }, 1000);
      }
    });
  }

  onSelect(job: Job) {
    this.jobService.setSelectedJob = job;
  }

}
