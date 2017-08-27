import { Component, OnInit, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JobService, JobDescription } from '../job.service';

interface Input {
  id: string;
  type: string;
  intputBinding: object;
}

interface InputElement {
  id: string;
  type: 'checkbox' | 'file' | 'number' | 'text';
}

interface FileInput {
  id: string;
  path: string;
}

interface Workflow {
  id: string;
  inputs: Input[];
  outputs: object;
  [x: string]: any;
}

interface FileLocations {
  [x: string]: FileInput;
}

@Component({
  selector: 'app-job-new',
  templateUrl: './job-new.component.html',
  styleUrls: ['./job-new.component.css']
})
export class JobNewComponent {

  jobForm: FormGroup;
  public inputs: InputElement[];

  files: FileLocations;

  @ViewChild('fileInput') fileInput;
  @ViewChildren('inputFileInput') inputFileInput;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private jobService: JobService,
    private viewContainerRef: ViewContainerRef) {
    this.jobForm = this.fb.group({
      name: ['', Validators.required ],
      inputControls: this.fb.group({})
    });

    this.inputs = [];
    this.files = {};
  }

  get inputControls(): FormGroup {
    return this.jobForm.get('inputControls') as FormGroup;
  }

  get jobName(): string {
    return this.jobForm.get('name').value as string;
  }

  processWorkflow() {
    const fi = this.fileInput.nativeElement;
    const name = this.jobName;
    if (fi.files && fi.files[0]) {
        const fileToUpload = fi.files[0];
        const reader = new FileReader();
        let workflow: Workflow;
        reader.onload = file => {
          const contents: any = file.target;
          workflow = JSON.parse(contents.result);

          console.log(workflow);

          const id: string = workflow.id;

          workflow.inputs.forEach(input => {
            const inputid: string = input.id.replace(id + '/', '');
            const inputElement: InputElement = {
              id: inputid,
              type: 'text'
            };

            if (input.type !== 'File') {
              this.inputControls.addControl(inputid, new FormControl('', Validators.required));
            }

            switch (input.type) {
              case 'string':
                inputElement.type = 'text';
                break;
              case 'boolean':
                inputElement.type = 'checkbox';
                break;
              case 'number':
                inputElement.type = 'number';
                break;
              case 'File':
                inputElement.type = 'file';
                break;
            }
            this.inputs.push(inputElement);
          });
        };
        reader.readAsText(fileToUpload);
    }
  }

  submit() {
    if (this.jobForm.valid) {
      this.uploadFiles().then(success => {
        this.submitJob();
      });
    }
  }

  uploadFiles(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const fi = this.fileInput.nativeElement;
      if (fi.files && fi.files[0]) {
        const fileToUpload = fi.files[0];
        const dirname = this.jobName;

        this.jobService.createDir(dirname).then(dirExists => {
          this.jobService.uploadFile('workflow', fi.files[0], dirname).then(success => {
            this.files['workflow'] = {
              id: 'workflow',
              path: dirname + '/' + fi.files[0].name
            };
            Promise.all(this.inputFileInput.map(element => {
              const native = element.nativeElement;
              if (native.files && native.files[0]) {
                return this.jobService.uploadFile(native.id, native.files[0], dirname).then(() => {
                  this.files[native.id] = {
                    id: native.id,
                    path: dirname + '/' + native.files[0].name
                  };
                });
              }
            })).then( () => {
              console.log('everything should be uploaded now.');
              resolve(true);
            });
          });
        });
      }
    });
  }

  submitJob() {
    const job: JobDescription = {
      name: this.jobName,
      workflow: this.files['workflow'].path,
      input: {
      }
    };

    const input = {};
    Object.keys(this.files).forEach(key => {
      if (key !== 'workflow') {
        input[key] = {
          class: 'File',
          path: this.files[key].path
        };
      }
    });
    Object.keys(this.inputControls.value).forEach(key => {
        input[key] = this.inputControls.value[key];
    });
    job.input = input;

    this.jobService.submitJob(job).subscribe(
      (value) => {
        console.log('Submission made');
        this.jobService.updateList = true;
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
