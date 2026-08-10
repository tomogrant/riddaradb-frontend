import { TestBed } from "@angular/core/testing";
import { SagaService } from "./saga.service";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting, HttpTestingController } from "@angular/common/http/testing";
import { ISagaResponseDto } from "./ISagaResponseDto";
import { ISagaRequestDto } from "./ISagaRequestDto";

describe('SagaService', () => {
    let service: SagaService;
    let httpMock: HttpTestingController;
    let sagaResponseDto: ISagaResponseDto = {
        id: 1,
        title: "Title",
        description: "Description",
        translated: false,
        bibDto: [],
        sagaVersions: []
    };

    let sagaResponseDtos : ISagaResponseDto[] = [sagaResponseDto];

    let sagaRequestDto: ISagaRequestDto = {
        id: 1,
        title: "Title",
        description: "Description",
        translated: false,
        sagaVersions: [],
        bibIds: []
    }

    const getUrl = '/api/sagas/getsagas';
    const getByIdUrl = '/api/sagas/getsagabyid/1';
    const postUrl = '/api/sagas/postsaga';
    const putUrl = '/api/sagas/putsaga';
    const deleteUrl = '/api/sagas/deletesaga/1';

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(SagaService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('service should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getSagas should return data', () => {
        service.getSagas().subscribe(result => {
            expect(result).toBeTruthy();
            expect(result.length).toBeGreaterThanOrEqual(1);
        });

        const req = httpMock.expectOne(getUrl);
        expect(req.request.method).toBe('GET');

        req.flush(sagaResponseDtos);
    });

    it('getSagaById should return data', () => {
        service.getSagaById(1).subscribe(result => {
            expect(result).toBeTruthy();
        });

        const req = httpMock.expectOne(getByIdUrl);
        expect(req.request.method).toBe('GET');

        req.flush(sagaResponseDto);
    });

    it('postSaga should post and return data', () => {
        service.postSaga(sagaRequestDto).subscribe(result => {
            expect(result).toBeTruthy();
        });

        const req = httpMock.expectOne(postUrl);
        expect(req.request.method).toBe('POST');

        req.flush(sagaResponseDto);
    });

    it('putSaga should put and return data', () => {
        service.putSaga(sagaRequestDto).subscribe(result => {
            expect(result).toBeTruthy();
        });

        const req = httpMock.expectOne(putUrl);
        expect(req.request.method).toBe('PUT');

        req.flush(sagaResponseDto);
    });

    it('deleteSaga should delete and return data', () => {
        service.deleteSaga(1).subscribe(result => {
            expect(result).toBeTruthy();
        });

        const req = httpMock.expectOne(deleteUrl);
        expect(req.request.method).toBe('DELETE');

        req.flush(sagaResponseDto);
    });
});