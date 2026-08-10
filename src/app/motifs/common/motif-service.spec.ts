import { TestBed } from "@angular/core/testing";
import { MotifService } from "./motif.service";
import { IMotif } from "./IMotif";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting, HttpTestingController } from "@angular/common/http/testing";
import { IMotifSearchResult } from "./IMotifSearchResult";

describe('MotifService', () => {
    let service: MotifService;
    let httpMock: HttpTestingController;

    let motif: IMotif = {
        id: 1,
        motifCode: "Code",
        motifName: "Name",
        description: "",
        parentId: null,
        sagaMotifs: []
    }

    let motifs: IMotif[] = [motif];

    let motifSearchResult: IMotifSearchResult = {
        searchResultId: 1,
        searchResultPath: []
    }

    let motifSearchResults = [motifSearchResult];

    const getUrl = '/api/motifs/getmotifs';
    const getRootMotifsUrl = '/api/motifs/getrootmotifs';
    const getChildMotifsUrl = '/api/motifs/getchildmotifsbyid/1';
    const searchMotifsUrl = '/api/motifs/searchmotifs/term';
    const searchMotifsExactUrl = '/api/motifs/searchmotifsexact/term';
    const postUrl = '/api/motifs/postmotif';
    const putUrl = '/api/motifs/putmotif';
    const deleteUrl = '/api/motifs/deletemotif/1';

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(MotifService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('service should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getMotifs should return data', () => {
        service.getMotifs().subscribe(result => {
            expect(result).toBeTruthy();
            expect(result.length).toBeGreaterThanOrEqual(1);
            expect(Array.isArray(result)).toBeTrue();
            expect(result.every(isIMotif)).toBeTrue();
        });

        const req = httpMock.expectOne(getUrl);
        expect(req.request.method).toBe('GET');

        req.flush(motifs);
    });

    it('getRootMotifs should return data', () => {
        service.getRootMotifs().subscribe(result => {
            expect(result).toBeTruthy();
            expect(result.length).toBeGreaterThanOrEqual(1);
            expect(Array.isArray(result)).toBeTrue();
            expect(result.every(isIMotif)).toBeTrue();
        });

        const req = httpMock.expectOne(getRootMotifsUrl);
        expect(req.request.method).toBe('GET');

        req.flush(motifs);
    });

    it('getChildMotifs should return data', () => {
        service.getChildren(1).subscribe(result => {
            expect(result).toBeTruthy();
            expect(result.length).toBeGreaterThanOrEqual(1);
            expect(Array.isArray(result)).toBeTrue();
            expect(result.every(isIMotif)).toBeTrue();
        });

        const req = httpMock.expectOne(getChildMotifsUrl);
        expect(req.request.method).toBe('GET');

        req.flush(motifs);
    });

    it('searchMotifs should return data', () => {
        service.searchMotifs("term").subscribe(result => {
            expect(result).toBeTruthy();
            expect(result.length).toBeGreaterThanOrEqual(1);
            expect(Array.isArray(result)).toBeTrue();
            expect(result.every(isIMotifSearchResult)).toBeTrue();
        });

        const req = httpMock.expectOne(searchMotifsUrl);
        expect(req.request.method).toBe('GET');

        req.flush(motifSearchResults);
    });

    it('searchMotifsExact should return data', () => {
        service.searchMotifsExactMatch("term").subscribe(result => {
            expect(result).toBeTruthy();
            expect(result.length).toBeGreaterThanOrEqual(1);
            expect(Array.isArray(result)).toBeTrue();
            expect(result.every(isIMotifSearchResult)).toBeTrue();
        });

        const req = httpMock.expectOne(searchMotifsExactUrl);
        expect(req.request.method).toBe('GET');

        req.flush(motifSearchResults);
    });

    it('postMotif should post and return data', () => {
        service.postMotif(motif).subscribe(result => {
            expect(result).toBeTruthy();
            expect(isIMotif(result)).toBeTrue();
        });

        const req = httpMock.expectOne(postUrl);
        expect(req.request.method).toBe('POST');

        req.flush(motif);
    });

    it('putMotif should put and return data', () => {
        service.updateMotif(motif).subscribe(result => {
            expect(result).toBeTruthy();
            expect(isIMotif(result)).toBeTrue();
        });

        const req = httpMock.expectOne(putUrl);
        expect(req.request.method).toBe('PUT');

        req.flush(motif);
    });

    it('deleteMotif should delete and return data', () => {
        service.deleteMotif(1).subscribe(result => {
            expect(result).toBeTruthy();
            expect(isIMotif(result)).toBeTrue();
        });

        const req = httpMock.expectOne(deleteUrl);
        expect(req.request.method).toBe('DELETE');

        req.flush(motif);
    });
});

function isIMotif(obj: unknown): obj is IMotif {
    return (typeof obj === "object" &&
        obj !== null &&
        "motifCode" in obj &&
        "motifName" in obj
    );
}

function isIMotifSearchResult(obj: unknown): obj is IMotifSearchResult {
    return (typeof obj === "object" &&
        obj !== null &&
        "searchResultId" in obj &&
        "searchResultPath" in obj
    );
}