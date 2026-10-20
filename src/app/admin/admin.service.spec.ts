import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting, HttpTestingController } from "@angular/common/http/testing";
import { AdminService } from "./admin.service";
import { IUser } from "./IUser";

describe("AdminService", () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  const getUrl = "/api/admin/getusers";
  const postUrl = "/api/admin/postuser";
  const putUrl = "/api/admin/putuser";
  const deleteUrl = "/api/admin/deleteuser/Existing user1";

  let users: IUser[] = [
    createUserWithId(1), 
    createUserWithId(2),
    createUserWithId(3)
  ];

  function createNewUser(): IUser {
    return {
      id: null,
      username: "New user",
      email: "Email@email.com",
      firstName: "Tom",
      lastNames: "Grant",
      password: "Password",
    };
  }

  function createUserWithId(id: number): IUser {
    return {
      id: id,
      username: "Existing user" + id,
      email: "Email" + id + "@email.com",
      firstName: "Tom",
      lastNames: "Grant",
      password: "Password",
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it("service should be created", () => {
    expect(service).toBeTruthy();
  });

  it("getUsers should return data", () => {
    service.getUsers().subscribe((result) => {
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result).toBeTruthy();
      expect(result[0].firstName).toBe("Tom");
    });

    const req = httpMock.expectOne(getUrl);
    expect(req.request.method).toBe("GET");

    req.flush(users);
  });

  it("postUser should post and return data", () => {
    service.postUser(createNewUser()).subscribe((result) => {
      expect(result).toBeTruthy();
      expect(result.firstName).toBe("Tom");
    });

    const req = httpMock.expectOne(postUrl);

    req.flush(createUserWithId(1));

    expect(req.request.method).toBe("POST");
  });

  it("putUser should put and return data", () => {
    service.putUser(createUserWithId(1)).subscribe((result) => {
      expect(result).toBeTruthy();
      expect(result.firstName).toBe("Tom");
    });

    const req = httpMock.expectOne(putUrl);
    expect(req.request.method).toBe("PUT");

    req.flush(createUserWithId(1));
  });

  it("deleteBib should delete", () => {
    service.deleteUser(createUserWithId(1).username).subscribe((result) => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(deleteUrl);
    expect(req.request.method).toBe("DELETE");

    req.flush(null);
  });
});
